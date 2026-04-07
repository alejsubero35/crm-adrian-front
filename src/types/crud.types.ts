export interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
  disabled?: boolean;
}

export interface CrudColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'number' | 'boolean' | 'image' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  format?: (value: any, item: any) => React.ReactNode;
  badgeVariant?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface CrudAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (item: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (item: any) => boolean;
  show?: (item: any) => boolean;
}

export interface CrudConfig<T = any> {
  // Basic configuration
  endpoint: string;
  title: string;
  pluralTitle?: string;
  
  // Table configuration
  columns: CrudColumn[];
  
  // Form configuration
  fields: CrudField[];
  
  // Actions
  actions?: CrudAction[];
  
  // Permissions
  permissions?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
  };
  
  // Features
  features?: {
    search?: boolean;
    pagination?: boolean;
    sorting?: boolean;
    filtering?: boolean;
    bulkActions?: boolean;
    export?: boolean;
  };
  
  // Customization
  pageSize?: number;
  emptyStateMessage?: string;
  createButtonLabel?: string;
  
  // Hooks
  onCreate?: (data: Partial<T>) => Promise<T>;
  onUpdate?: (id: string | number, data: Partial<T>) => Promise<T>;
  onDelete?: (id: string | number) => Promise<void>;
  onBeforeCreate?: (data: Partial<T>) => Partial<T> | void;
  onAfterCreate?: (item: T) => void;
  onBeforeUpdate?: (id: string | number, data: Partial<T>) => Partial<T> | void;
  onAfterUpdate?: (item: T) => void;
  onBeforeDelete?: (id: string | number) => void;
  onAfterDelete?: (id: string | number) => void;
}

export interface CrudState<T = any> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: Record<string, any>;
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  selectedItems: (string | number)[];
}

export interface CrudContextType<T = any> extends CrudState<T> {
  // Data operations
  fetchItems: (params?: any) => Promise<void>;
  createItem: (data: Partial<T>) => Promise<void>;
  updateItem: (id: string | number, data: Partial<T>) => Promise<void>;
  deleteItem: (id: string | number) => Promise<void>;
  deleteItems: (ids: (string | number)[]) => Promise<void>;
  
  // UI operations
  setPagination: (page: number, limit?: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
  setSelectedItems: (items: (string | number)[]) => void;
  
  // Modal operations
  openCreateModal: () => void;
  openEditModal: (item: T) => void;
  closeModals: () => void;
  
  // State
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingItem: T | null;
}
