
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from pydantic import BaseModel
from app.core.database import Base
from datetime import datetime

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id, self.model.deleted_at == None).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100, filters: dict = None, search: str = None, search_fields: List[str] = None, sort_by: str = "created_at", sort_desc: bool = True) -> List[ModelType]:
        query = db.query(self.model).filter(self.model.deleted_at == None)
        if filters:
            for k, v in filters.items():
                if hasattr(self.model, k) and v is not None:
                    query = query.filter(getattr(self.model, k) == v)
        if search and search_fields:
            search_filters = [getattr(self.model, f).ilike(f"%{search}%") for f in search_fields if hasattr(self.model, f)]
            if search_filters:
                query = query.filter(or_(*search_filters))
        
        if hasattr(self.model, sort_by):
            order_col = getattr(self.model, sort_by)
            query = query.order_by(desc(order_col) if sort_desc else asc(order_col))
            
        return query.offset(skip).limit(limit).all()

    def count(self, db: Session, filters: dict = None) -> int:
        query = db.query(self.model).filter(self.model.deleted_at == None)
        if filters:
            for k, v in filters.items():
                if hasattr(self.model, k) and v is not None:
                    query = query.filter(getattr(self.model, k) == v)
        return query.count()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> ModelType:
        obj_data = db_obj.__dict__
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: str) -> ModelType:
        obj = db.query(self.model).get(id)
        if obj and hasattr(obj, 'deleted_at'):
            obj.deleted_at = datetime.utcnow()
            obj.status = "DELETED"
            db.add(obj)
            db.commit()
        return obj
