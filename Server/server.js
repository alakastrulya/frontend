const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Настройка Multer для загрузки файлов (резюме и аватарок)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, 'resumes/');
    } else if (file.fieldname === 'avatar') {
      cb(null, 'avatars/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Функция для чтения данных из файла
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { categories: [], services: [], specialists: [], users: [], admin: [], moderators: [], orders: [], reviews: [] };
  }
};

// Функция для записи данных в файл
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw new Error('Failed to write to file');
  }
};

// Загружаем данные из db.json
let dbData = { categories: [], services: [], specialists: [], users: [], admin: [], moderators: [], orders: [], reviews: [] };
const loadData = async () => {
  dbData = await readJsonFile('db.json');
  console.log('Data loaded successfully:', dbData);
};
loadData();

// Логин пользователя
app.post('/login', async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Проверяем в users
    let user = dbData.users.find(u => u.contact === contact);
    let type = 'user';

    // Проверяем в specialists
    if (!user) {
      user = dbData.specialists.find(s => s.contact === contact);
      type = 'specialist';
    }

    // Проверяем в admin
    if (!user) {
      user = dbData.admin.find(a => a.contact === contact);
      type = 'admin';
    }

    // Проверяем в moderators
    if (!user) {
      user = dbData.moderators.find(m => m.contact === contact);
      type = 'moderator';
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid contact or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid contact or password' });
    }

    res.status(200).json({ user: { id: user.id, name: user.name, type }, type });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Регистрация пользователя
app.post('/users', upload.none(), async (req, res) => {
  try {
    const { name, contact, password } = req.body;
    if (!name || !contact || !password) {
      return res.status(400).json({ message: 'Name, contact, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(dbData.users.length + 1),
      name,
      contact,
      password: hashedPassword
    };
    dbData.users.push(newUser);
    await writeJsonFile('db.json', dbData);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error in /users route:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

const calculateAverageUserRating = (userId) => {
  const userRatings = dbData.userRatings.filter(rating => rating.userId === userId);
  return userRatings.length > 0
    ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length
    : null;
};

// Функция для вычисления среднего рейтинга специалиста
const calculateAverageRating = (specialistId, forModerator = false) => {
  let specialistReviews = dbData.reviews.filter(review => review.specialistId === specialistId);
  
  // Если запрос не от модератора, учитываем только видимые отзывы
  if (!forModerator) {
    specialistReviews = specialistReviews.filter(review => !review.isHidden);
  }

  return specialistReviews.length > 0
    ? specialistReviews.reduce((sum, review) => sum + review.rating, 0) / specialistReviews.length
    : null;
};


// Получение списка специалистов (только активных для главной страницы)
app.get('/specialists', async (req, res) => {
  try {
    const { serviceId } = req.query;
    let filteredSpecialists = dbData.specialists.filter(s => s.isActive); // Только активные

    if (serviceId) {
      filteredSpecialists = filteredSpecialists.filter(specialist =>
        specialist.serviceIds.includes(serviceId)
      );
    }
    // Добавляем средний рейтинг для каждого специалиста
    const specialistsWithRating = filteredSpecialists.map(specialist => {
      const averageRating = calculateAverageRating(specialist.id);
      return { ...specialist, averageRating };
    });

    res.status(200).json(specialistsWithRating);
  } catch (error) {
    console.error('Error in /specialists route:', error);
    res.status(500).json({ message: 'Error fetching specialists', error: error.message });
  }
});

// Получение списка всех специалистов для администратора (включая неактивных)
app.get('/admin/specialists', async (req, res) => {
  try {
    const specialistsWithRating = dbData.specialists.map(specialist => {
      const averageRating = calculateAverageRating(specialist.id);
      return { ...specialist, averageRating };
    });

    res.status(200).json(specialistsWithRating);
  } catch (error) {
    console.error('Error in /admin/specialists route:', error);
    res.status(500).json({ message: 'Error fetching specialists', error: error.message });
  }
});

// Получение списка специалистов для модератора
app.get('/moderator/specialists', async (req, res) => {
  try {
    const specialistsWithRating = dbData.specialists.map(specialist => {
      const averageRating = calculateAverageRating(specialist.id);
      return { ...specialist, averageRating };
    });

    res.status(200).json(specialistsWithRating);
  } catch (error) {
    console.error('Error in /moderator/specialists route:', error);
    res.status(500).json({ message: 'Error fetching specialists', error: error.message });
  }
});

// Переключение статуса активности специалиста администратором
app.post('/admin/toggle-active/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const specialist = dbData.specialists.find(s => s.id === id);
    if (!specialist) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    specialist.isActive = !specialist.isActive; // Переключаем статус
    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: `Specialist ${specialist.isActive ? 'activated' : 'deactivated'} successfully`, specialist });
  } catch (error) {
    console.error('Error in /admin/toggle-active route:', error);
    res.status(500).json({ message: 'Error toggling specialist status', error: error.message });
  }
});

// Регистрация специалиста с загрузкой резюме
// app.post('/specialists', upload.single('resume'), async (req, res) => {
//   try {
//     const { name, contact, password, description, serviceIds } = req.body;
//     if (!name || !contact || !password) {
//       return res.status(400).json({ message: 'Name, contact, and password are required' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newSpecialist = {
//       id: String(dbData.specialists.length + 1),
//       name,
//       contact,
//       password: hashedPassword,
//       description: description || '',
//       serviceIds: serviceIds ? JSON.parse(serviceIds) : [],
//       resumeFile: req.file ? `resumes/${req.file.filename}` : null,
//       isVerified: false
//     };
//     dbData.specialists.push(newSpecialist);

//     // Добавляем специалиста в users
//     const newUser = {
//       id: newSpecialist.id,
//       name,
//       contact,
//       password: hashedPassword
//     };
//     dbData.users.push(newUser);

//     await writeJsonFile('db.json', dbData);
//     res.status(201).json({ message: 'Specialist registered successfully', specialist: newSpecialist });
//   } catch (error) {
//     console.error('Error in /specialists route:', error);
//     res.status(500).json({ message: 'Error registering specialist', error: error.message });
//   }
// });
// Регистрация специалиста с загрузкой резюме и аватарки
app.post('/specialists', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, contact, password, description, serviceIds } = req.body;
    if (!name || !contact || !password) {
      return res.status(400).json({ message: 'Name, contact, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSpecialist = {
      id: String(dbData.specialists.length + 1),
      name,
      contact,
      password: hashedPassword,
      description: description || '',
      serviceIds: serviceIds ? JSON.parse(serviceIds) : [],
      resumeFile: req.files['resume'] ? `resumes/${req.files['resume'][0].filename}` : null,
      avatarFile: req.files['avatar'] ? `avatars/${req.files['avatar'][0].filename}` : null,
      isVerified: false,
      isActive: true
    };
    dbData.specialists.push(newSpecialist);

    const newUser = {
      id: newSpecialist.id,
      name,
      contact,
      password: hashedPassword
    };
    dbData.users.push(newUser);

    await writeJsonFile('db.json', dbData);
    res.status(201).json({ message: 'Specialist registered successfully', specialist: newSpecialist });
  } catch (error) {
    console.error('Error in /specialists route:', error);
    res.status(500).json({ message: 'Error registering specialist', error: error.message });
  }
});

// Обновление профиля специалиста с загрузкой резюме и аватарки
app.put('/specialists/:id', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, description, serviceIds, currentPassword, password } = req.body;

    const specialist = dbData.specialists.find(s => s.id === id);
    if (!specialist) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    if (password) {
      const isMatch = await bcrypt.compare(currentPassword, specialist.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      specialist.password = await bcrypt.hash(password, 10);
    }

    specialist.name = name || specialist.name;
    specialist.contact = contact || specialist.contact;
    specialist.description = description || specialist.description;
    specialist.serviceIds = serviceIds ? JSON.parse(serviceIds) : specialist.serviceIds;

    if (req.files['resume']) {
      if (specialist.resumeFile) {
        await fs.unlink(path.join(__dirname, specialist.resumeFile)).catch(err => {
          console.error('Error deleting old resume:', err);
        });
      }
      specialist.resumeFile = `resumes/${req.files['resume'][0].filename}`;
    }

    if (req.files['avatar']) {
      if (specialist.avatarFile) {
        await fs.unlink(path.join(__dirname, specialist.avatarFile)).catch(err => {
          console.error('Error deleting old avatar:', err);
        });
      }
      specialist.avatarFile = `avatars/${req.files['avatar'][0].filename}`;
    } else if (!specialist.avatarFile) {
      specialist.avatarFile = null;
    }

    const user = dbData.users.find(u => u.id === id);
    if (user) {
      user.name = name || user.name;
      user.contact = contact || user.contact;
      if (password) {
        user.password = specialist.password;
      }
    }

    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: 'Specialist updated successfully', specialist });
  } catch (error) {
    console.error('Error in /specialists route:', error);
    res.status(500).json({ message: 'Error updating specialist', error: error.message });
  }
});


// Обновление профиля пользователя
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, currentPassword, password } = req.body;

    const user = dbData.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Проверяем текущий пароль
    if (password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    // Обновляем данные
    user.name = name || user.name;
    user.contact = contact || user.contact;

    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Обновление профиля специалиста с загрузкой резюме
// app.put('/specialists/:id', upload.single('resume'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, contact, description, serviceIds, currentPassword, password } = req.body;

//     const specialist = dbData.specialists.find(s => s.id === id);
//     if (!specialist) {
//       return res.status(404).json({ message: 'Specialist not found' });
//     }

//     // Проверяем текущий пароль
//     if (password) {
//       const isMatch = await bcrypt.compare(currentPassword, specialist.password);
//       if (!isMatch) {
//         return res.status(400).json({ message: 'Current password is incorrect' });
//       }
//       specialist.password = await bcrypt.hash(password, 10);
//     }

//     // Обновляем данные
//     specialist.name = name || specialist.name;
//     specialist.contact = contact || specialist.contact;
//     specialist.description = description || specialist.description;
//     specialist.serviceIds = serviceIds ? JSON.parse(serviceIds) : specialist.serviceIds;
//     if (req.file) {
//       // Удаляем старое резюме, если оно есть
//       if (specialist.resumeFile) {
//         await fs.unlink(path.join(__dirname, specialist.resumeFile)).catch(err => {
//           console.error('Error deleting old resume:', err);
//         });
//       }
//       specialist.resumeFile = `resumes/${req.file.filename}`;
//     }

//     // Обновляем пользователя в users
//     const user = dbData.users.find(u => u.id === id);
//     if (user) {
//       user.name = name || user.name;
//       user.contact = contact || user.contact;
//       if (password) {
//         user.password = specialist.password;
//       }
//     }

//     await writeJsonFile('db.json', dbData);
//     res.status(200).json({ message: 'Specialist updated successfully', specialist });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating specialist', error: error.message });
//   }
// });

// Обновление профиля администратора
app.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, currentPassword, password } = req.body;

    const admin = dbData.admin.find(a => a.id === id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Проверяем текущий пароль
    if (password) {
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      admin.password = await bcrypt.hash(password, 10);
    }

    // Обновляем данные
    admin.name = name || admin.name;
    admin.contact = contact || admin.contact;

    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
});

// Обновление профиля модератора
app.put('/moderators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, currentPassword, password } = req.body;

    const moderator = dbData.moderators.find(m => m.id === id);
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    // Проверяем текущий пароль
    if (password) {
      const isMatch = await bcrypt.compare(currentPassword, moderator.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      moderator.password = await bcrypt.hash(password, 10);
    }

    // Обновляем данные
    moderator.name = name || moderator.name;
    moderator.contact = contact || moderator.contact;

    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: 'Moderator updated successfully', moderator });
  } catch (error) {
    res.status(500).json({ message: 'Error updating moderator', error: error.message });
  }
});

// Скрыть/показать отзыв
app.post('/moderator/reviews/:id/toggle-hidden', async (req, res) => {
  try {
    const { id } = req.params;
    const review = dbData.reviews.find(r => r.id === id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isHidden = !review.isHidden; // Переключаем статус скрытия
    await writeJsonFile('db.json', dbData);
    res.status(200).json({ 
      message: `Review ${review.isHidden ? 'hidden' : 'shown'} successfully`, 
      review 
    });
  } catch (error) {
    console.error('Error in /moderator/reviews/:id/toggle-hidden route:', error);
    res.status(500).json({ message: 'Error toggling review visibility', error: error.message });
  }
});

// Создание нового заказа
app.post('/orders', async (req, res) => {
  try {
    const { userId, specialistId, description } = req.body;
    console.log('Creating new order:', { userId, specialistId, description });

    if (!userId || !specialistId || !description) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'userId, specialistId, and description are required' });
    }

    const specialist = dbData.specialists.find(s => s.id === specialistId);
    if (!specialist) {
      console.log('Specialist not found:', specialistId);
      return res.status(404).json({ message: 'Specialist not found' });
    }

    const user = dbData.users.find(u => u.id === userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const newOrder = {
      id: String(dbData.orders.length + 1),
      userId,
      specialistId,
      description,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      hasReviewed: false
    };
    dbData.orders.push(newOrder);
    console.log('New order created:', newOrder);
    await writeJsonFile('db.json', dbData);
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error in /orders route:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Получение заказов (для специалиста)
app.get('/orders', async (req, res) => {
  try {
    const { specialistId, userId } = req.query;
    if (!specialistId && !userId) {
      return res.status(400).json({ message: 'specialistId or userId is required' });
    }

    let orders = dbData.orders;
    if (specialistId) {
      orders = orders.filter(order => order.specialistId === specialistId);
      // Добавляем информацию о клиенте и его среднем рейтинге
      orders = orders.map(order => {
        const user = dbData.users.find(u => u.id === order.userId);
        const averageUserRating = calculateAverageUserRating(order.userId);
        return { ...order, user: user ? { id: user.id, name: user.name } : null, averageUserRating };
      });
    }
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
      // Добавляем информацию о специалисте
      orders = orders.map(order => {
        const specialist = dbData.specialists.find(s => s.id === order.specialistId);
        return { ...order, specialist: specialist ? { id: specialist.id, name: specialist.name } : null };
      });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in /orders route:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.post('/orders/:id/rate-user', async (req, res) => {
  try {
    const { id } = req.params;
    const { specialistId, userId, rating } = req.body;

    if (!specialistId || !userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'specialistId, userId, and rating (1-5) are required' });
    }

    const order = dbData.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.specialistId !== specialistId) {
      return res.status(403).json({ message: 'You are not authorized to rate this user' });
    }

    if (order.status !== 'Completed') {
      return res.status(400).json({ message: 'Order must be completed to rate the user' });
    }

    if (order.hasRatedUser) {
      return res.status(400).json({ message: 'You have already rated this user for this order' });
    }

    const newUserRating = {
      id: String(dbData.userRatings.length + 1),
      userId,
      specialistId,
      rating: parseInt(rating),
      createdAt: new Date().toISOString()
    };

    dbData.userRatings.push(newUserRating);
    order.hasRatedUser = true;

    await writeJsonFile('db.json', dbData);
    res.status(201).json({ message: 'User rated successfully', userRating: newUserRating });
  } catch (error) {
    console.error('Error in /orders/:id/rate-user route:', error);
    res.status(500).json({ message: 'Error rating user', error: error.message });
  }
});

app.post('/orders/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Добавляем "Declined" в список допустимых статусов
    if (!['Pending', 'In Progress', 'Completed', 'Declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = dbData.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error in /orders/:id/update-status route:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// Получение данных пользователя
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = dbData.users.find(u => u.id === id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Получение данных специалиста
app.get('/specialists/:id', async (req, res) => {
  const { id } = req.params;
  const specialist = dbData.specialists.find(s => s.id === id);
  if (specialist) {
    res.status(200).json(specialist);
  } else {
    res.status(404).json({ message: 'Specialist not found' });
  }
});
app.get('/specialists/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query; // Передаем тип пользователя в query (опционально)

    const specialist = dbData.specialists.find(s => s.id === id);
    if (!specialist) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    let reviews = dbData.reviews.filter(review => review.specialistId === id);
    if (userType !== 'moderator') {
      reviews = reviews.filter(review => !review.isHidden); // Скрытые отзывы не возвращаются
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error in /specialists/:id/reviews route:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Добавление нового отзыва
app.post('/specialists/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'userId and rating (1-5) are required' });
    }

    const specialist = dbData.specialists.find(s => s.id === id);
    if (!specialist) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    // Проверяем, оставлял ли пользователь уже отзыв для этого специалиста
    const existingReview = dbData.reviews.find(review => review.specialistId === id && review.userId === userId);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this specialist' });
    }

    // Проверяем, есть ли завершённый заказ у пользователя с этим специалистом
    const completedOrder = dbData.orders.find(order =>
      order.userId === userId &&
      order.specialistId === id &&
      order.status === 'Completed' &&
      !order.hasReviewed
    );
    if (!completedOrder) {
      return res.status(400).json({ message: 'No completed order found to review this specialist' });
    }

    const newReview = {
      id: String(dbData.reviews.length + 1),
      specialistId: id,
      userId,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    dbData.reviews.push(newReview);

    // Обновляем флаг hasReviewed в заказе
    completedOrder.hasReviewed = true;

    await writeJsonFile('db.json', dbData);
    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    console.error('Error in /specialists/:id/reviews route:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Получение данных администратора
app.get('/admin/:id', async (req, res) => {
  const { id } = req.params;
  const admin = dbData.admin.find(a => a.id === id);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(404).json({ message: 'Admin not found' });
  }
});

// Получение данных модератора
app.get('/moderators/:id', async (req, res) => {
  const { id } = req.params;
  const moderator = dbData.moderators.find(m => m.id === id);
  if (moderator) {
    res.status(200).json(moderator);
  } else {
    res.status(404).json({ message: 'Moderator not found' });
  }
});


// Подтверждение/отклонение специалиста модератором
app.post('/moderator/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const specialist = dbData.specialists.find(s => s.id === id);
    if (!specialist) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    specialist.isVerified = isVerified;
    await writeJsonFile('db.json', dbData);
    res.status(200).json({ message: `Specialist ${isVerified ? 'verified' : 'denied'} successfully`, specialist });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying specialist', error: error.message });
  }
});

// Маршруты для категорий и услуг
app.get('/categories', async (req, res) => {
  res.json(dbData.categories);
});

app.get('/services', async (req, res) => {
  const { categoryId } = req.query;
  let filteredServices = dbData.services;
  if (categoryId) {
    filteredServices = dbData.services.filter(service => service.categoryId === categoryId);
  }
  res.json(filteredServices);
});

app.get('/services/:id', async (req, res) => {
  const { id } = req.params;
  const service = dbData.services.find(s => s.id === id);
  if (service) {
    res.status(200).json(service);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});

// Для скачивания резюме
app.use('/resumes', express.static('resumes'));
app.use('/avatars', express.static('avatars'));

app.listen(3001, () => {
  console.log('Server running on port 3001');
});