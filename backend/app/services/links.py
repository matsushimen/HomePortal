from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from app.models.link import Link
from app.schemas.link import LinkCreate, LinkUpdate


def list_links(session: Session) -> List[Link]:
    statement = select(Link).order_by(Link.title.asc())
    return list(session.exec(statement).all())


def search_links(session: Session, query: Optional[str], tags: Optional[List[str]]) -> List[Link]:
    statement = select(Link)
    if query:
        like_query = f"%{query.lower()}%"
        statement = statement.where(Link.title.ilike(like_query) | Link.url.ilike(like_query))
    if tags:
        for tag in tags:
            statement = statement.where(Link.tags.contains([tag]))
    statement = statement.order_by(Link.click_count.desc(), Link.title.asc())
    return list(session.exec(statement).all())


def create_link(session: Session, payload: LinkCreate, owner_id: Optional[int]) -> Link:
    data = payload.model_dump()
    data["url"] = str(payload.url)
    link = Link(**data, owner_id=owner_id)
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


def update_link(session: Session, link_id: int, payload: LinkUpdate) -> Link:
    link = session.get(Link, link_id)
    if link is None:
        raise ValueError("Link not found")
    update_data = payload.model_dump(exclude_unset=True)
    if "url" in update_data and update_data["url"] is not None:
        update_data["url"] = str(update_data["url"])
    for field, value in update_data.items():
        setattr(link, field, value)
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


def delete_link(session: Session, link_id: int) -> None:
    link = session.get(Link, link_id)
    if link is None:
        raise ValueError("Link not found")
    session.delete(link)
    session.commit()


def register_click(session: Session, link_id: int) -> Link:
    link = session.get(Link, link_id)
    if link is None:
        raise ValueError("Link not found")
    link.click_count += 1
    link.last_accessed_at = datetime.utcnow()
    session.add(link)
    session.commit()
    session.refresh(link)
    return link
