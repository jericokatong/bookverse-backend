const { schema, updateBookSchema } = require('./validator');
const prisma = require('../../../database');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { policyFor } = require('../../../policy');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

const createBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('create', 'Book')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk create book'
      );
    }

    // validasi req.body
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // ambil isi req body
    const {
      judul_buku,
      nama_pengarang,
      penerbit,
      tahun_terbit,
      isbn,
      total_stock,
    } = req.body;

    // validasi jika buku sudah ada
    const isBook = await prisma.book.findFirst({
      where: {
        judul_buku,
      },
    });
    if (isBook) {
      throw new InvariantError('Book already exists');
    }

    // insert buku ke database
    const book = await prisma.book.create({
      data: {
        judul_buku,
        nama_pengarang,
        penerbit,
        tahun_terbit,
        isbn,
        jumlah_tersedia: total_stock,
        jumlah_dipinjam: 0,
        total_stock,
      },
    });

    // kembalikan respon kepada user
    return res.status(201).json({
      status: 'success',
      message: 'Berhasil menambahkan data buku',
      data: {
        book,
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

const getBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('read', 'Book')) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk get book');
    }

    const books = await prisma.book.findMany();

    return res.json({
      status: 'success',
      message: 'Berhasil dapat semua data buku',
      data: {
        books,
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

const updateBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('update', 'Book')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk update book'
      );
    }

    // ambil id buku dari req params
    const { id } = req.params;

    // validasi req body
    const validationResult = updateBookSchema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // ambil isi dari req body
    const {
      judul_buku,
      nama_pengarang,
      penerbit,
      tahun_terbit,
      isbn,
      jumlah_tersedia,
    } = req.body;

    // verifikasi jika buku itu ada
    const isBook = await prisma.book.findFirst({
      where: {
        id,
      },
    });
    if (!isBook) {
      throw new NotFoundError('Buku tidak ditemukan');
    }

    // update buku di database
    // kondisi jika ada jumlah tersedia berubah
    let book;
    if (jumlah_tersedia) {
      book = await prisma.book.update({
        where: {
          id,
        },
        data: {
          judul_buku,
          nama_pengarang,
          penerbit,
          tahun_terbit,
          isbn,
          jumlah_tersedia,
          total_stock: jumlah_tersedia + isBook.jumlah_dipinjam,
        },
      });
    } else {
      book = await prisma.book.update({
        where: {
          id,
        },
        data: {
          judul_buku,
          nama_pengarang,
          penerbit,
          tahun_terbit,
          isbn,
        },
      });
    }

    return res.json({
      status: 'success',
      message: `Berhasil update buku dengan id = ${isBook.id}`,
      data: {
        book,
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

const deleteBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('delete', 'Book')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk create admin'
      );
    }

    // ambil id buku dari req params
    const { id } = req.params;

    // cek apakah buku benar-benar ada
    const isBook = await prisma.book.findFirst({
      where: {
        id,
      },
    });
    if (!isBook) {
      throw new NotFoundError(
        'Buku tidak dapat dihapus, karena buku tidak ditemukan'
      );
    }

    // hapus buku pada database
    await prisma.book.delete({
      where: {
        id,
      },
    });

    // kembalikan response kepada penjaga bahwa buku sudah dihapus
    return res.json({
      status: 'success',
      message: `Buku dengan judul ${isBook.judul_buku} telah berhasil dihapus`,
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

module.exports = {
  createBook,
  getBook,
  updateBook,
  deleteBook,
};
