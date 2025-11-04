from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoRead, TodoUpdate
from app.services import todos as todo_service

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=List[TodoRead])
def list_todos(session: Session = Depends(get_session)) -> List[TodoRead]:
    records = todo_service.list_todos(session)
    return [TodoRead.model_validate(record, from_attributes=True) for record in records]


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(
    payload: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TodoRead:
    record = todo_service.create_todo(session, payload)
    return TodoRead.model_validate(record, from_attributes=True)


@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> TodoRead:
    try:
        record = todo_service.update_todo(session, todo_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return TodoRead.model_validate(record, from_attributes=True)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        todo_service.delete_todo(session, todo_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
