const bcrypt = require('bcrypt');
const { schema } = require('./validator');
const prisma = require('../../../database');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { policyFor } = require('../../../policy');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

const createPenjaga = async (req, res) => {
  console.log('masuk sini');
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('create', 'Penjaga')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk create penjaga'
      );
    }

    // validasi req body dulu
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    // validasi username
    const isThereUser = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });
    if (isThereUser) {
      throw new InvariantError('Username already exist');
    }

    // enkripsi password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role,
      },
    });

    // kembalikan respon kepada user
    return res.status(201).json({
      status: 'success',
      message: 'Berhasil membuat akun penjaga',
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
      console.log(error);
      return res.status(500).json({
        status: 'fail',
        message: 'Error pada server',
      });
    }
  }
};

const getRequestBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('get', 'Request')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk get request book'
      );
    }

    // select di database peminjam dengan status waiting
    const waiting = await prisma.borrowing_Transaction.findMany({
      where: {
        status_peminjaman: 'WAITING',
      },
      include: {
        peminjam: true,
        buku: true,
      },
    });

    // mapping data dari database ke data respons yaitu hanya nama_peminjam, judul buku
    const mappingResponse = waiting.map((item, index) => {
      return {
        id: item.id,
        nama_peminjam: item.peminjam.name,
        judul_buku: item.buku.judul_buku,
        status: item.status_peminjaman,
      };
    });

    // kembalikan response ke penjaga mengenai dafatar sedan request untuk meminjam
    return res.json({
      status: 'success',
      data: mappingResponse,
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

const approveRequest = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('approve', 'Request')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk approve request pinjaman'
      );
    }

    // ambil id borrowing dari req params
    const { id_borrowing } = req.params;

    // cek apakah transaksi peminjaman tersebut benar-benar ada atau tidak
    const isBorrowing = await prisma.borrowing_Transaction.findFirst({
      where: {
        id: id_borrowing,
      },
      include: {
        buku: true,
        peminjam: true,
      },
    });
    if (!isBorrowing) {
      throw new NotFoundError('Id Transaksi peminjaman tidak ditemukan');
    }

    // cek apakah jumlah buku tersedia masih lebih dari nol
    if (isBorrowing.buku.jumlah_tersedia <= 0) {
      throw new InvariantError('Buku yang tersedia untuk buku ini sudah habis');
    }

    // hasil setelah pinjam untuk jumlah_tersedia, jumlah_dipinjam, total_stock
    const jumlah_tersedia = isBorrowing.buku.jumlah_tersedia - 1;
    const jumlah_dipinjam = isBorrowing.buku.jumlah_dipinjam + 1;

    // mengurangi jumlah buku yang akan dipinjam
    await prisma.book.update({
      where: {
        id: isBorrowing.id_buku,
      },
      data: {
        jumlah_tersedia,
        jumlah_dipinjam,
      },
    });

    // update status_peminjaman
    await prisma.borrowing_Transaction.update({
      where: {
        id: id_borrowing,
      },
      data: {
        status_peminjaman: 'APPROVED',
      },
    });

    // kembalikan respons berhasil
    return res.json({
      status: 'success',
      message: `Berhasil approve peminjaman buku ${isBorrowing.buku.judul_buku} oleh ${isBorrowing.peminjam.name}`,
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

const rejectRequest = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('reject', 'Request')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk reject request'
      );
    }

    // ambil id borrowing dari req params
    const { id_borrowing } = req.params;

    // cek apakah transaksi peminjaman tersebut benar-benar ada atau tidak
    const isBorrowing = await prisma.borrowing_Transaction.findFirst({
      where: {
        id: id_borrowing,
      },
      include: {
        buku: true,
        peminjam: true,
      },
    });
    if (!isBorrowing) {
      throw new NotFoundError('Id Transaksi peminjaman tidak ditemukan');
    }

    // update status_peminjaman
    await prisma.borrowing_Transaction.update({
      where: {
        id: id_borrowing,
      },
      data: {
        status_peminjaman: 'REJECTED',
      },
    });

    // kembalikan respons berhasil
    return res.json({
      status: 'success',
      message: `Berhasil reject peminjaman buku ${isBorrowing.buku.judul_buku} oleh ${isBorrowing.peminjam.name}`,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
    } else {
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
  }
};

const getListBorrower = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('get', 'Borrower')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk get borrower'
      );
    }

    // select list borrower di database
    const borrower = await prisma.borrowing_Transaction.findMany({
      where: {
        status_peminjaman: 'APPROVED',
      },
      include: {
        peminjam: true,
        buku: true,
      },
    });

    // mapping data yang dibutuhkan
    const mappingBorrower = borrower.map((item, index) => {
      return {
        id: item.id,
        nama_peminjam: item.peminjam.name,
        buku_yang_dipinjam: item.buku.judul_buku,
      };
    });

    // kembalikan response kepada user
    return res.json({
      status: 'success',
      message: 'Data peminjam yang sedang meminjam buku',
      data: mappingBorrower,
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

const getSummaryBookTransaction = async (req, res) => {
  try {
    // ambil summary
    const countBuku = await prisma.book.count();

    const jumlah_tersedia = await prisma.book.findMany();
    let counter = 0;
    jumlah_tersedia.forEach((item) => {
      counter = counter + item.jumlah_tersedia;
    });

    const borrowing = await prisma.borrowing_Transaction.findMany({
      where: {
        status_peminjaman: 'APPROVED',
      },
    });

    return res.json({
      status: 'success',
      message: 'summary',
      data: {
        countBuku,
        jumlahTersedia: counter,
        jumlahMeminjam: borrowing.length,
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

module.exports = {
  createPenjaga,
  getRequestBook,
  approveRequest,
  rejectRequest,
  getListBorrower,
  getSummaryBookTransaction,
};
