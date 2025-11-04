from __future__ import annotations

from datetime import datetime

from sqlmodel import Session, select

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


def list_todos(session: Session) -> list[Todo]:
    statement = select(Todo).order_by(Todo.status.asc(), Todo.due.asc().nulls_last(), Todo.title.asc())
    return list(session.exec(statement).all())


def create_todo(session: Session, payload: TodoCreate) -> Todo:
    todo = Todo(**payload.dict())
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def update_todo(session: Session, todo_id: int, payload: TodoUpdate) -> Todo:
    todo = session.get(Todo, todo_id)
    if todo is None:
        raise ValueError("Todo not found")
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    if todo.status == "done" and todo.completed_at is None:
        todo.completed_at = datetime.utcnow()
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def delete_todo(session: Session, todo_id: int) -> None:
    todo = session.get(Todo, todo_id)
    if todo is None:
        raise ValueError("Todo not found")
    session.delete(todo)
    session.commit()
