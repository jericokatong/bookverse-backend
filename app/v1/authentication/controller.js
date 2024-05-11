const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const prisma = require('../../../database');
const InvariantError = require('../../../exceptions/InvariantError');
const {
  registrationSchema,
  peminjamLoginSchema,
  penjagaLoginSchema,
  adminLoginSchema,
  refreshTokenSchema,
} = require('./validator');
const AuthenticationError = require('../../../exceptions/AuthenticationError');

const registerPeminjam = async (req, res) => {
  try {
    // validasi req.body
    const validationResult = registrationSchema.validate(req.body);
    if (validationResult.error) {
      // lempar error invariantError
      throw new InvariantError(validationResult.error.message);
    }

    // cek apakah username sudah ada di database atau belum
    const isThereUsername = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });
    if (isThereUsername) {
      throw new InvariantError('username already exist');
    }

    // enkripsi password user dengan menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // masukkan req body ke database
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
      },
    });

    // kembalikan respon ke user
    return res.status(201).json({
      status: 'success',
      message: 'Berhasil Registrasi Akun Peminjam',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const loginPeminjam = async (req, res) => {
  try {
    // validasi req.body
    const validationResult = peminjamLoginSchema.validate(req.body);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // validasi apakah ada user
    const isThereUser = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        role: 'PEMINJAM',
      },
    });

    if (!isThereUser) {
      throw new InvariantError('Username or Passowrd Incorrect');
    }

    // validasi password
    const matchPassword = await bcrypt.compare(
      req.body.password,
      isThereUser.password
    );

    if (!matchPassword) {
      throw new InvariantError('Username of Password Incorrect');
    }

    // generate token
    const accessToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.accessTokenKey,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.refreshTokenKey,
      { expiresIn: '7d' }
    );

    // insert refresh token pada tabel authentication
    await prisma.authentication.create({
      data: {
        token: refreshToken,
      },
    });

    return res.json({
      status: 'success',
      message: 'Berhasil login user',
      data: {
        id: isThereUser.id,
        name: isThereUser.name,
        username: isThereUser.username,
        role: isThereUser.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      console.log(error);
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const loginPenjaga = async (req, res) => {
  try {
    // validasi req.body
    const validationResult = penjagaLoginSchema.validate(req.body);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // validasi apakah ada user
    const isThereUser = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        role: 'PENJAGA',
      },
    });

    if (!isThereUser) {
      throw new InvariantError('Username or Passowrd Incorrect');
    }

    // validasi password
    const matchPassword = await bcrypt.compare(
      req.body.password,
      isThereUser.password
    );

    if (!matchPassword) {
      throw new InvariantError('Username of Password Incorrect');
    }

    // generate token
    const accessToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.accessTokenKey,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.refreshTokenKey,
      { expiresIn: '7d' }
    );

    // insert refresh token pada tabel authentication
    await prisma.authentication.create({
      data: {
        token: refreshToken,
      },
    });

    return res.json({
      status: 'success',
      message: 'Berhasil login penjaga',
      data: {
        id: isThereUser.id,
        name: isThereUser.name,
        username: isThereUser.username,
        role: isThereUser.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      console.log(error);
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const loginAdmin = async (req, res) => {
  try {
    // validasi req.body
    const validationResult = adminLoginSchema.validate(req.body);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // validasi apakah ada user
    const isThereUser = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        role: 'ADMIN',
      },
    });

    if (!isThereUser) {
      throw new InvariantError('Username or Passowrd Incorrect');
    }

    // validasi password
    const matchPassword = await bcrypt.compare(
      req.body.password,
      isThereUser.password
    );

    if (!matchPassword) {
      throw new InvariantError('Username of Password Incorrect');
    }

    // generate token
    const accessToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.accessTokenKey,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: isThereUser.id, role: isThereUser.role },
      config.refreshTokenKey,
      { expiresIn: '7d' }
    );

    // insert refresh token pada tabel authentication
    await prisma.authentication.create({
      data: {
        token: refreshToken,
      },
    });

    return res.json({
      status: 'success',
      message: 'Berhasil login admin',
      data: {
        id: isThereUser.id,
        name: isThereUser.name,
        username: isThereUser.username,
        role: isThereUser.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      console.log(error);
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const updateAccessToken = async (req, res) => {
  try {
    // validasi refresh req.body
    const validationResult = refreshTokenSchema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // cek apakah ada refresh token tersebut pada database
    const isRefreshToken = await prisma.authentication.findFirst({
      where: {
        token: req.body.refreshToken,
      },
    });
    if (!isRefreshToken) {
      throw new AuthenticationError('Refresh Token tidak valid');
    }

    const { id, role } = jwt.verify(
      req.body.refreshToken,
      config.refreshTokenKey
    );

    const accessToken = jwt.sign({ id, role }, config.accessTokenKey, {
      expiresIn: '1h',
    });

    res.json({
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else if (error.name === 'TokenExpiredError') {
      await prisma.authentication.delete({
        where: {
          token: req.body.refreshToken,
        },
      });

      return res.status(401).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const logout = async (req, res) => {
  try {
    // validasi refreshToken
    const validationResult = refreshTokenSchema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // verifikasi refreshToken pada database
    const valid = await prisma.authentication.findFirst({
      where: {
        token: req.body.refreshToken,
      },
    });
    if (!valid) {
      throw new AuthenticationError('Refresh token tidak valid');
    }

    // delete refresh token pada database
    await prisma.authentication.delete({
      where: {
        token: req.body.refreshToken,
      },
    });

    // kembalikan respon
    return res.json({
      status: 'success',
      message: 'Berhasil logout',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

module.exports = {
  registerPeminjam,
  loginPeminjam,
  loginPenjaga,
  loginAdmin,
  updateAccessToken,
  logout,
};
