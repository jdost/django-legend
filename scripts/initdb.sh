#!/bin/sh

# DB.ENGINE
while true; do
   read -p "Enter in the Database Engine you are using: " ENGINE
   case $ENGINE in
      "sqlite3") break;;
      "mysql") break;;
      "postgresql") break;;
      "postgresql_psycopg2") break;;
      "oracle") break;;
      *) echo ""
         echo "   Options are: \"mysql\", \"oracle\", \"sqlite3\""
         echo "       \"postgresql\", and \"postgresql_psycopg2\""
         echo ""
   esac
done

if [ $ENGINE = "sqlite3" ]; then
   NAME=""
   PASSWORD=""
   read -p "Enter the name of the .db file (should be in the root of the venv): " TABLE
else
   read -p "Enter the name of the table in the database: " TABLE
   read -p "Enter the username of the database login: " NAME
   read -p "Enter the password of the database login: " PASSWORD
fi

read -p "Enter the hostname of the database's location [\"\"]: " HOST
read -p "Enter the port of the database's location [\"\"]: " PORT

DBFILE=$1/db.py
echo "engine   = \"$ENGINE\""    > $DBFILE
echo "table    = \"$TABLE\""    >> $DBFILE
echo "username = \"$NAME\""     >> $DBFILE
echo "password = \"$PASSWORD\"" >> $DBFILE
echo "host     = \"$HOST\""     >> $DBFILE
echo "port     = \"$PORT\""     >> $DBFILE

