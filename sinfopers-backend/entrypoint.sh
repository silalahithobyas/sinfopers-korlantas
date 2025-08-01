#!/bin/sh

# Tunggu sampai PostgreSQL siap
echo "Menunggu PostgreSQL..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.1
done
echo "PostgreSQL siap!"

# Jalankan migrasi database
python manage.py migrate --noinput

# Buat direktori untuk static dan media jika belum ada
python manage.py collectstatic --noinput

# Eksekusi command yang diberikan
exec "$@"