import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomButton } from '@/components/ui/custom-button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive';
  disabled?: (row: any) => boolean;
  className?: string;
}

export interface GenericTableProps<T = any> {
  data: T[];
  columns: TableColumn[];
  actions?: TableAction[];
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  onRowExpand?: (row: T) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
}

export function GenericTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  error,
  title,
  description,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  expandable = false,
  onRowExpand,
  pagination,
  onSearch,
  onFilter,
  onSort,
  onRefresh,
  onExport,
  onAdd,
  selectedRows = [],
  onSelectionChange,
  emptyState,
  className,
}: GenericTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (!sortable) return;
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(row => row.id);
      setSelected(new Set(allIds));
      onSelectionChange?.(data);
    } else {
      setSelected(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelected(newSelected);
    
    const selectedData = data.filter(row => newSelected.has(row.id));
    onSelectionChange?.(selectedData);
  };

  // Handle row expansion
  const handleToggleExpand = (id: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Render cell content
  const renderCell = (column: TableColumn, row: T) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default rendering based on type
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sí' : 'No'}
        </Badge>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    
    return value || '-';
  };

  // Render empty state
  if (data.length === 0 && !loading) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {emptyState?.icon || (
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{emptyState?.title || 'No hay datos'}</h3>
            <p className="text-muted-foreground mb-4">
              {emptyState?.description || 'No se encontraron registros para mostrar.'}
            </p>
            {emptyState?.action && (
              <Button onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('card-modern', className)}>
      {(title || description || searchable || filterable) && (
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && <CardTitle className="text-xl font-semibold">{title}</CardTitle>}
              {description && <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onRefresh} 
                  disabled={loading}
                  className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-smooth"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>
              )}
              {onExport && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onExport}
                  className="rounded-lg hover:bg-muted/80 transition-smooth"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
              {onAdd && (
                <Button 
                  onClick={onAdd}
                  className="btn-primary-modern rounded-full h-10 px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva categoría
                </Button>
              )}
            </div>
          </div>
          
          {searchable && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-modern pl-10 h-10 bg-muted/30 border-border/50 hover:border-border transition-smooth"
                />
              </div>
              {filterable && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-lg hover:bg-muted/80 transition-smooth h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                {expandable && (
                  <TableHead className="w-12 py-3.5">
                    <span className="sr-only">Expandir</span>
                  </TableHead>
                )}
                {selectable && (
                  <TableHead className="w-12 py-3.5">
                    <Checkbox
                      checked={selected.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={cn(
                      'py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30',
                      column.sortable && sortable && 'cursor-pointer hover:bg-muted/50 transition-smooth',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-1',
                      column.align === 'right' && 'justify-end',
                      column.align === 'center' && 'justify-center'
                    )}>
                      <span>{column.label}</span>
                      {column.sortable && sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="w-24 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-border/30">
                    {expandable && (
                      <TableCell className="py-4 px-4">
                        <div className="h-4 w-4 skeleton rounded" />
                      </TableCell>
                    )}
                    {selectable && (
                      <TableCell className="py-4 px-4">
                        <div className="h-4 w-4 skeleton rounded" />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className="py-4 px-4">
                        <div className="h-4 skeleton rounded" />
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="py-4 px-4">
                        <div className="h-8 w-16 skeleton rounded" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                data.map((row) => {
                  const isExpanded = expandedRows.has(row.id);
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow className="border-b border-border/30 hover:bg-muted/30 transition-smooth group">
                        {expandable && (
                          <TableCell className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleExpand(row.id)}
                              className="h-6 w-6 rounded-md hover:bg-muted/80 transition-smooth"
                            >
                              <ChevronDown className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )} />
                            </Button>
                          </TableCell>
                        )}
                        {selectable && (
                          <TableCell className="py-4 px-4">
                            <Checkbox
                              checked={selected.has(row.id)}
                              onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell 
                            key={column.key} 
                            className={cn(
                              'py-4 px-4 text-sm',
                              column.align === 'right' && 'text-right',
                              column.align === 'center' && 'text-center',
                              column.className
                            )}
                          >
                            {renderCell(column, row)}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              {actions.slice(0, 2).map((action) => {
                                const isDisabled = action.disabled?.(row);
                                return (
                                  <Button
                                    key={action.key}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => !isDisabled && action.onClick(row)}
                                    disabled={isDisabled}
                                    className={cn(
                                      'h-8 w-8 rounded-full hover:bg-muted/80 transition-smooth',
                                      action.variant === 'destructive' && 'hover:bg-destructive/10 hover:text-destructive',
                                      action.className
                                    )}
                                  >
                                    {action.icon}
                                  </Button>
                                );
                              })}
                              {actions.length > 2 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/80 transition-smooth">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass-card">
                                    {actions.slice(2).map((action) => {
                                      const isDisabled = action.disabled?.(row);
                                      return (
                                        <DropdownMenuItem
                                          key={action.key}
                                          onClick={() => !isDisabled && action.onClick(row)}
                                          disabled={isDisabled}
                                          className={cn(
                                            'cursor-pointer transition-smooth',
                                            action.variant === 'destructive' && 'text-destructive focus:text-destructive focus:bg-destructive/10',
                                            action.className
                                          )}
                                        >
                                          {action.icon}
                                          <span className="ml-2">{action.label}</span>
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                      {expandable && isExpanded && onRowExpand && (
                        <TableRow className="border-b border-border/30 bg-muted/20">
                          <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0) + 1} className="py-4 px-4">
                            {onRowExpand(row)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination && (
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
                {pagination.total} resultados
              </span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-20 h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
                className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-smooth"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-smooth"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }).map((_, index) => {
                  const page = index + 1;
                  const isActive = page === pagination.page;
                  return (
                    <Button
                      key={page}
                      variant={isActive ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => pagination.onPageChange(page)}
                      className={cn(
                        'h-9 w-9 rounded-lg transition-smooth',
                        isActive ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-muted/80'
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-smooth"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-smooth"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
