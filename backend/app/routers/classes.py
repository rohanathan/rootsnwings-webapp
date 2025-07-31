from fastapi import APIRouter, HTTPException
from app.models.class_models import ClassItem, ClassListResponse, FeaturedClassResponse, WorkshopListResponse
from app.services.class_service import (
    fetch_all_classes,
    fetch_all_workshops,
    fetch_featured_classes,
    fetch_upcoming_workshops,
    fetch_class_by_id
)

router = APIRouter(
    prefix="/classes",
    tags=["Classes"]
)


@router.get("/", response_model=ClassListResponse)
def get_all_classes():
    return {"classes": fetch_all_classes()}


@router.get("/featured", response_model=FeaturedClassResponse)
def get_featured_classes():
    return {"featured": fetch_featured_classes()}


@router.get("/workshops", response_model=WorkshopListResponse)
def get_all_workshops():
    return {"workshops": fetch_all_workshops()}


@router.get("/workshops/upcoming", response_model=WorkshopListResponse)
def get_upcoming_workshops():
    return {"workshops": fetch_upcoming_workshops()}


@router.get("/{class_id}", response_model=ClassItem)
def get_class_by_id(class_id: str):
    data = fetch_class_by_id(class_id)
    if not data:
        raise HTTPException(status_code=404, detail="Class not found")
    return data


