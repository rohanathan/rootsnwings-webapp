# Backend Issues & TODOs

## ❌ CRITICAL: search_classes Function Inefficiency

**Issue**: The `search_classes` function in `backend/app/services/class_service.py` is **completely broken and inefficient**. Workshop filtering is not working at all.

**Current Status**: 
- ✅ Frontend implementation is correct - sends proper API parameters
- ✅ API endpoints are structured correctly 
- ❌ **Backend search_classes function fails to apply filters properly**
- ❌ **All workshop filter requests return ALL workshops regardless of parameters**

**Evidence**:
- Frontend sends: `category=music`, `ageGroup=adult`, `format=online`
- Backend receives parameters correctly
- Database query in search_classes ignores or incorrectly processes filter parameters
- Result: All workshops returned instead of filtered subset

**Root Cause**: 
The `search_classes` function likely has:
1. Incorrect Firestore query construction
2. Filter parameters not being applied to the actual database query
3. Composite index issues preventing proper filtering
4. Logic errors in filter application

**Impact**:
- 🚫 Workshop filtering completely non-functional
- 🚫 Search functionality broken
- 🚫 User experience severely degraded
- 🚫 Cannot filter by category, age group, format, price, or dates

**TODO - HIGH PRIORITY**:
1. **Completely rewrite** `search_classes` function
2. **Debug Firestore query construction** step-by-step
3. **Test each filter parameter individually** 
4. **Add proper error handling and logging**
5. **Ensure composite indexes exist** for multi-field queries
6. **Implement fallback mechanisms** if complex queries fail

**Files Affected**:
- `backend/app/services/class_service.py` - search_classes function
- `backend/app/routers/classes.py` - calls search_classes for workshop filtering

**Priority**: 🔥 **URGENT** - Core functionality broken

---

## Workshop Listing Frontend Status ✅ 

**Current State**: Frontend implementation is **COMPLETE and CORRECT**
- ✅ Search input functional
- ✅ All filters properly mapped to API parameters  
- ✅ Category dropdown loads from metadata API
- ✅ Age group values match backend expectations
- ✅ Price range filtering implemented
- ✅ Date filtering with proper date calculations
- ✅ Debounced API calls (300ms)
- ✅ Loading states and error handling
- ✅ Real-time filtering triggers

**Waiting For**: Backend search_classes function fix

---

*Last Updated: 2025-08-13*
*Reporter: Claude Code Assistant*