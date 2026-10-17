from fastapi import APIRouter, HTTPException
from mysql.connector import Error

from app.database import get_connection
from app.schemas import TodoCreate, TodoUpdate

router = APIRouter(prefix="/todos", tags=["Todos"])


def fetch_todo(cursor, todo_id):
    cursor.execute(
        """
        SELECT id, title, description, completed, created_at, updated_at
        FROM todos
        WHERE id = %s
        """,
        (todo_id,),
    )
    todo = cursor.fetchone()

    if todo:
        todo["completed"] = bool(todo["completed"])

    return todo


@router.get("")
def get_todos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT id, title, description, completed, created_at, updated_at
            FROM todos
            ORDER BY created_at DESC
            """
        )

        todos = cursor.fetchall()

        for todo in todos:
            todo["completed"] = bool(todo["completed"])

        return todos

    except Error:
        raise HTTPException(500, "Could not fetch todos.")

    finally:
        cursor.close()
        conn.close()


@router.post("", status_code=201)
def create_todo(todo: TodoCreate):
    title = todo.title.strip()

    if not title:
        raise HTTPException(422, "Title cannot be empty.")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            INSERT INTO todos (title, description)
            VALUES (%s, %s)
            """,
            (title, todo.description),
        )

        todo_id = cursor.lastrowid
        conn.commit()

        return fetch_todo(cursor, todo_id)

    except Error:
        conn.rollback()
        raise HTTPException(500, "Could not create todo.")

    finally:
        cursor.close()
        conn.close()


@router.put("/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        existing = fetch_todo(cursor, todo_id)

        if not existing:
            raise HTTPException(404, "Todo not found.")

        changes = todo.model_dump(exclude_unset=True)

        if not changes:
            return existing

        title = changes.get("title", existing["title"])
        description = changes.get("description", existing["description"])
        completed = changes.get("completed", existing["completed"])

        if title is None or not title.strip():
            raise HTTPException(422, "Title cannot be empty.")

        if len(title) > 200:
            raise HTTPException(422, "Title cannot exceed 200 characters.")

        if description is not None and len(description) > 2000:
            raise HTTPException(
                422, "Description cannot exceed 2000 characters."
            )

        if completed is None:
            raise HTTPException(422, "Completed must be true or false.")

        cursor.execute(
            """
            UPDATE todos
            SET title = %s, description = %s, completed = %s
            WHERE id = %s
            """,
            (title.strip(), description, completed, todo_id),
        )

        conn.commit()

        return fetch_todo(cursor, todo_id)

    except HTTPException:
        raise

    except Error:
        conn.rollback()
        raise HTTPException(500, "Could not update todo.")

    finally:
        cursor.close()
        conn.close()


@router.delete("/{todo_id}")
def delete_todo(todo_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM todos WHERE id = %s",
            (todo_id,),
        )

        if cursor.rowcount == 0:
            raise HTTPException(404, "Todo not found.")

        conn.commit()

        return {"message": "Todo deleted successfully."}

    except HTTPException:
        raise

    except Error:
        conn.rollback()
        raise HTTPException(500, "Could not delete todo.")

    finally:
        cursor.close()
        conn.close()