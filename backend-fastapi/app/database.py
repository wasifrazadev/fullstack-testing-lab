import os
from dotenv import load_dotenv
from mysql.connector.pooling import MySQLConnectionPool

load_dotenv()

pool = MySQLConnectionPool(
    pool_name="todo_pool",
    pool_size=5,
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", "3306")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME", "todo_testing"),
)


def get_connection():
    return pool.get_connection()