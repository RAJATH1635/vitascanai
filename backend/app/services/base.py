
from typing import List, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.crud.base import CRUDBase

class BaseService:
    def __init__(self, crud: CRUDBase):
        self.crud = crud
        
    def get(self, db: Session, id: str):
        obj = self.crud.get(db, id=id)
        if not obj:
            raise HTTPException(status_code=404, detail="Item not found")
        return obj

    def get_list(self, db: Session, skip: int = 0, limit: int = 100, filters: dict = None, search: str = None, search_fields: List[str] = None):
        items = self.crud.get_multi(db, skip=skip, limit=limit, filters=filters, search=search, search_fields=search_fields)
        total = self.crud.count(db, filters=filters)
        return {"items": items, "total": total, "page": (skip//limit)+1 if limit>0 else 1, "size": limit}
        
    def create(self, db: Session, obj_in: Any):
        return self.crud.create(db, obj_in=obj_in)
        
    def update(self, db: Session, id: str, obj_in: Any):
        db_obj = self.get(db, id)
        return self.crud.update(db, db_obj=db_obj, obj_in=obj_in)
        
    def delete(self, db: Session, id: str):
        self.get(db, id) # check exists
        return self.crud.remove(db, id=id)
