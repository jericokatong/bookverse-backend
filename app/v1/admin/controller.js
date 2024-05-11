const bcrypt = require('bcrypt');
const { schema, updateUserSchema } = require('./validator');
const prisma = require('../../../database');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { policyFor } = require('../../../policy');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

const createAdmin = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('create', 'Admin')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk create admin'
      );
    }

    // validasi req.body
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // validasi username
    const isThereUsername = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        role: req.body.role,
      },
    });
    if (isThereUsername) {
      throw new InvariantError('Username already exist');
    }

    // enkripsi password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // insert pada database
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role,
      },
    });

    // return response
    return res.status(201).json({
      status: 'success',
      message: 'Berhasil membuat akun admin',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
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

const getUser = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('read', 'User')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk get data user'
      );
    }

    // dapatkan akun peminjam dan penjaga
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            role: 'PEMINJAM',
          },
          {
            role: 'PENJAGA',
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });

    return res.json({
      status: 'fail',
      message: 'Berhasil dapat data akun peminjam dan penjaga',
      data: {
        users,
      },
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

const updateUserById = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('update', 'User')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk update user'
      );
    }

    // ambil id dari params
    const { id } = req.params;

    // validasi req.body
    const validationResult = updateUserSchema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // verifikasi user di database
    const isUser = await prisma.user.findFirst({
      where: {
        id,
      },
    });
    if (!isUser) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const data = req.body;

    // update data di database
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });

    return res.json({
      status: 'success',
      message: 'Berhasil update user',
      data: {
        user,
      },
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

const deleteUserById = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('delete', 'User')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk delete user'
      );
    }

    // ambil id dari req.params
    const { id } = req.params;

    // verifikasi user di database
    const isUser = await prisma.user.findFirst({
      where: {
        id,
      },
    });
    if (!isUser) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // hapus data user di database
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });

    // kembalikan respon kepada user
    return res.json({
      status: 'success',
      message: `Berhasil hapus user  dengan username = ${user.username}`,
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
  createAdmin,
  getUser,
  updateUserById,
  deleteUserById,
};
