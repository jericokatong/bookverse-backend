const { createPinjamanSchema } = require('./validator');
const prisma = require('../../../database');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { policyFor } = require('../../../policy');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

const createPinjaman = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('create', 'Pinjaman')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk create pinjaman'
      );
    }

    // ambil id buku yang akan dipinjam
    const { id_buku } = req.params;

    // ambil id peminjam dari req user dari authentication
    const id_peminjam = req.user.id;

    // verifikasi keberadaan user
    const isUser = await prisma.user.findFirst({
      where: {
        id: id_peminjam,
      },
    });
    if (!isUser) {
      throw new NotFoundError('id_peminjam tidak ditemukan');
    }

    // cek keberadaan buku berdasarkan id dan pastikan jumlah tersedia lebih dari nol atau tidak
    const isBookReady = await prisma.book.findFirst({
      where: {
        id: id_buku,
      },
    });
    if (!isBookReady) {
      throw new NotFoundError('Buku yang dipinjam tidak ditemukan');
    }
    if (isBookReady.jumlah_tersedia === 0) {
      throw new InvariantError(
        'Buku ini sudah tidak tersedia, Silahkan pinjam buku lain'
      );
    }

    // validasi peminjam belum meminjam buku apapun dan tidak ada di waiting list
    const isSedangMeminjamBuku = await prisma.borrowing_Transaction.findFirst({
      where: {
        AND: [
          {
            id_peminjam,
          },
          {
            OR: [
              {
                status_peminjaman: 'WAITING',
              },
              {
                status_peminjaman: 'APPROVED',
              },
            ],
          },
        ],
      },
    });
    if (isSedangMeminjamBuku) {
      throw new InvariantError(
        'Anda hanya diperbolehkan meminjam 1 buku. Kemungkinan anda sedang meminjam buku atau sedang berada di waiting list. Mohon untuk tunggu, jika sedang berada di waiting list'
      );
    }

    // insert pinjaman ke tabel database
    const borrowing_book = await prisma.borrowing_Transaction.create({
      data: {
        id_peminjam,
        id_buku,
      },
    });

    // update jumlah tersedia buku dan jumlah pinjaman
    // const jumlah_tersedia_sebelum_pinjam = isBookReady.jumlah_tersedia;
    // const jumlah_tersedia_sesudah_pinjam = jumlah_tersedia_sebelum_pinjam - 1;
    // const jumlah_dipinjam_sebelum_pinjam = isBookReady.jumlah_dipinjam;
    // const jumlah_dipinjam_sesudah_pinjam = jumlah_dipinjam_sebelum_pinjam + 1;

    // await prisma.book.update({
    //   where: {
    //     id: id_buku,
    //   },
    //   data: {
    //     jumlah_tersedia: jumlah_tersedia_sesudah_pinjam,
    //     jumlah_dipinjam: jumlah_dipinjam_sesudah_pinjam,
    //   },
    // });

    return res.status(201).json({
      status: 'success',
      message: 'Berhasil membuat pinjaman',
      data: {
        borrowing_book,
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

const getBukuPinjamanSaya = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('get', 'Pinjaman')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk get pinjaman saya'
      );
    }

    // ambil id_peminjam
    const { id_peminjam } = req.params;

    // cek apakah user sedang berada di waiting list
    const isWaiting = await prisma.borrowing_Transaction.findFirst({
      where: {
        AND: [
          {
            status_peminjaman: 'WAITING',
          },
          {
            id_peminjam,
          },
        ],
      },
      include: {
        buku: true,
      },
    });
    if (isWaiting) {
      return res.json({
        status: 'success',
        message: `Anda sedang berada di waiting list untuk buku dengan judul ${isWaiting.buku.judul_buku}`,
      });
    }

    // cek jika user sedang meminjam buku
    const isApproved = await prisma.borrowing_Transaction.findFirst({
      where: {
        AND: [
          {
            status_peminjaman: 'APPROVED',
          },
          {
            id_peminjam,
          },
        ],
      },
      include: {
        buku: true,
      },
    });
    if (isApproved) {
      return res.json({
        status: 'success',
        message: `Buku yang sedang anda pinjam yaitu ${isApproved.buku.judul_buku}`,
        data: {
          id_borrowing: isApproved.id,
        },
      });
    }

    // user tidak sedang meminjam buku apapun maka kembalikan respon
    return res.json({
      status: 'success',
      message: 'Anda tidak sedang meminjam buku apapun',
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

const returnBook = async (req, res) => {
  try {
    // authorization
    let policy = policyFor(req.user);
    if (!policy.can('return', 'Book')) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses untuk return book'
      );
    }

    // ambil id_borrowing
    const { id_borrowing } = req.params;

    // cek apakah id transaksi borrowing benar benar ada dan status = approved
    const isBorrowing = await prisma.borrowing_Transaction.findFirst({
      where: {
        AND: [
          {
            id: id_borrowing,
          },
          {
            status_peminjaman: 'APPROVED',
          },
        ],
      },
      include: {
        buku: true,
      },
    });
    if (!isBorrowing) {
      throw new NotFoundError(
        'Tidak ditemukan id transaksi untuk peminjaman buku'
      );
    }

    // ubah jumlah buku
    const jumlah_tersedia = isBorrowing.buku.jumlah_tersedia + 1;
    const jumlah_dipinjam = isBorrowing.buku.jumlah_dipinjam - 1;

    await prisma.book.update({
      where: {
        id: isBorrowing.id_buku,
      },
      data: {
        jumlah_tersedia,
        jumlah_dipinjam,
      },
    });

    // kembalikan buku dengan ubah status pada tabel borrowing_transaction
    await prisma.borrowing_Transaction.update({
      where: {
        id: id_borrowing,
      },
      data: {
        status_peminjaman: 'RETURNED',
      },
    });

    // kembalikan response kepada user
    return res.json({
      status: 'success',
      message: `Berhasil mengembalikan buku ${isBorrowing.buku.judul_buku}`,
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
  createPinjaman,
  getBukuPinjamanSaya,
  getBukuPinjamanSaya,
  returnBook,
};
