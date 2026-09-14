#!/usr/bin/env bash
# =======================================================
#   TUONG TAN TOEIC - MONGODB RESTORE SCRIPT (VPS LINUX)
# =======================================================

set -e

ARCHIVE_FILE="${1:-tuong_tan_toeic_prod.archive}"

echo "======================================================="
echo "  RESTORING TUONG TAN TOEIC DATABASE ON VPS"
echo "======================================================="

if [ ! -f "$ARCHIVE_FILE" ]; then
    echo "❌ [ERROR] File $ARCHIVE_FILE khong ton tai!"
    echo "Vui long upload file archive vao thu muc nay."
    exit 1
fi

echo "Dang bung du lieu tu file: $ARCHIVE_FILE..."
mongorestore --db=tuong_tan_toeic --archive="$ARCHIVE_FILE" --gzip --drop

echo ""
echo "✅ [SUCCESS] Bung du lieu hoan tat!"
echo "Kiem tra so luong ban ghi trong DB:"
mongosh tuong_tan_toeic --quiet --eval "
  console.log('Mocktests:', db.mocktests.countDocuments());
  console.log('Reading Exercises:', db.readingexercises.countDocuments());
  console.log('Listening Exercises:', db.listeningexercises.countDocuments());
  console.log('Vocab Topics:', db.vocabtopics.countDocuments());
"
