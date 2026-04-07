import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BaseService, BaseResource } from '../services/base/base.service';
import { CrudConfig, CrudContextType, CrudState } from '../types/crud.types';

function createCrudContext<T extends BaseResource = BaseResource>() {
  const Context = createContext<CrudContextType<T> | undefined>(undefined);

  const Provider: React.FC<{
    children: ReactNode;
    config: CrudConfig<T>;
  }> = ({ children, config }) => {
    const service = new BaseService<T>(config.endpoint);
    
    const [state, setState] = useState<CrudState<T>>({
      items: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: config.pageSize || 10,
        total: 0,
        totalPages: 0,
      },
      filters: {},
      sorting: {
        field: 'id',
        direction: 'asc',
      },
      selectedItems: [],
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);

    const setStateWithLoading = useCallback((updates: Partial<CrudState<T>>) => {
      setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fetchItems = useCallback(async (params?: any) => {
      setStateWithLoading({ loading: true, error: null });
      
      try {
        const requestParams = {
          page: state.pagination.page,
          limit: state.pagination.limit,
          sortBy: state.sorting.field,
          sortOrder: state.sorting.direction,
          ...state.filters,
          ...params,
        };

        const response = await service.getAll(requestParams);
        
        setStateWithLoading({
          items: response.data,
          loading: false,
          pagination: {
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
          },
        });
      } catch (error) {
        setStateWithLoading({
          loading: false,
          error: error instanceof Error ? error.message : 'Error al cargar los datos',
        });
      }
    }, [state.pagination.page, state.pagination.limit, state.sorting, state.filters, service, setStateWithLoading]);

    const createItem = useCallback(async (data: Partial<T>) => {
      try {
        let processedData = data;
        
        if (config.onBeforeCreate) {
          const result = config.onBeforeCreate(data);
          if (result) processedData = result;
        }

        const newItem = config.onCreate 
          ? await config.onCreate(processedData)
          : await service.create(processedData);

        if (config.onAfterCreate) {
          config.onAfterCreate(newItem);
        }

        await fetchItems();
        closeModals();
      } catch (error) {
        setStateWithLoading({
          error: error instanceof Error ? error.message : 'Error al crear el elemento',
        });
        throw error;
      }
    }, [config, service, fetchItems, setStateWithLoading]);

    const updateItem = useCallback(async (id: string | number, data: Partial<T>) => {
      try {
        let processedData = data;
        
        if (config.onBeforeUpdate) {
          const result = config.onBeforeUpdate(id, data);
          if (result) processedData = result;
        }

        const updatedItem = config.onUpdate 
          ? await config.onUpdate(id, processedData)
          : await service.update(id, processedData);

        if (config.onAfterUpdate) {
          config.onAfterUpdate(updatedItem);
        }

        await fetchItems();
        closeModals();
      } catch (error) {
        setStateWithLoading({
          error: error instanceof Error ? error.message : 'Error al actualizar el elemento',
        });
        throw error;
      }
    }, [config, service, fetchItems, setStateWithLoading]);

    const deleteItem = useCallback(async (id: string | number) => {
      try {
        if (config.onBeforeDelete) {
          config.onBeforeDelete(id);
        }

        if (config.onDelete) {
          await config.onDelete(id);
        } else {
          await service.delete(id);
        }

        if (config.onAfterDelete) {
          config.onAfterDelete(id);
        }

        await fetchItems();
      } catch (error) {
        setStateWithLoading({
          error: error instanceof Error ? error.message : 'Error al eliminar el elemento',
        });
        throw error;
      }
    }, [config, service, fetchItems, setStateWithLoading]);

    const deleteItems = useCallback(async (ids: (string | number)[]) => {
      try {
        await service.bulkDelete(ids);
        await fetchItems();
      } catch (error) {
        setStateWithLoading({
          error: error instanceof Error ? error.message : 'Error al eliminar los elementos',
        });
        throw error;
      }
    }, [service, fetchItems, setStateWithLoading]);

    const setPagination = useCallback((page: number, limit?: number) => {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          page,
          ...(limit && { limit }),
        },
      }));
    }, []);

    const setFilters = useCallback((filters: Record<string, any>) => {
      setState(prev => ({
        ...prev,
        filters,
        pagination: { ...prev.pagination, page: 1 },
      }));
    }, []);

    const setSorting = useCallback((field: string, direction: 'asc' | 'desc') => {
      setState(prev => ({
        ...prev,
        sorting: { field, direction },
      }));
    }, []);

    const setSelectedItems = useCallback((items: (string | number)[]) => {
      setState(prev => ({ ...prev, selectedItems: items }));
    }, []);

    const openCreateModal = useCallback(() => {
      setIsCreateModalOpen(true);
      setIsEditModalOpen(false);
      setEditingItem(null);
    }, []);

    const openEditModal = useCallback((item: T) => {
      setIsEditModalOpen(true);
      setIsCreateModalOpen(false);
      setEditingItem(item);
    }, []);

    const closeModals = useCallback(() => {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setEditingItem(null);
    }, []);

    const value: CrudContextType<T> = {
      ...state,
      fetchItems,
      createItem,
      updateItem,
      deleteItem,
      deleteItems,
      setPagination,
      setFilters,
      setSorting,
      setSelectedItems,
      openCreateModal,
      openEditModal,
      closeModals,
      isCreateModalOpen,
      isEditModalOpen,
      editingItem,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useCrud = (): CrudContextType<T> => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useCrud must be used within a CrudProvider');
    }
    return context;
  };

  return { Provider, useCrud };
}

export default createCrudContext;
