#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Templates embebidos directamente
const SCHEMA_TEMPLATE = `import { z } from 'zod';

export const {{ENTITY_CAMEL}}Schema = z.object({
{{FIELDS}}
});

export type {{ENTITY_CAMEL}}FormData = z.infer<typeof {{ENTITY_CAMEL}}Schema>;
`;

const CRUD_TEMPLATE = `import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { {{ENTITY_CAMEL}}Schema, {{ENTITY_CAMEL}}FormData } from '@/validations/{{ENTITY_LOWER}}.schema';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { ValidatedCheckbox } from '@/components/ui/ValidatedCheckbox';

type {{ENTITY_PASCAL}} = {
  id: number;
{{TYPE_FIELDS}}
};

export default function {{ENTITY_PASCAL}}CRUD() {
  const { toast } = useToast();
  
  const [{{ENTITY_LOWER}}s, set{{ENTITY_PASCAL}}s] = useState<{{ENTITY_PASCAL}}[]>([
{{MOCK_DATA}}
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing{{ENTITY_PASCAL}}, setEditing{{ENTITY_PASCAL}}] = useState<{{ENTITY_PASCAL}} | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [{{ENTITY_LOWER}}ToDelete, set{{ENTITY_PASCAL}}ToDelete] = useState<{{ENTITY_PASCAL}} | null>(null);

  const createForm = useForm<{{ENTITY_CAMEL}}FormData>({
    resolver: zodResolver({{ENTITY_CAMEL}}Schema),
    defaultValues: {
{{DEFAULT_VALUES}}
    },
    mode: 'onSubmit',
  });

  const editForm = useForm<{{ENTITY_CAMEL}}FormData>({
    resolver: zodResolver({{ENTITY_CAMEL}}Schema),
    defaultValues: {
{{DEFAULT_VALUES}}
    },
    mode: 'onSubmit',
  });

  const handleEdit = ({{ENTITY_LOWER}}: {{ENTITY_PASCAL}}) => {
    setEditing{{ENTITY_PASCAL}}({{ENTITY_LOWER}});
    editForm.reset({
{{EDIT_RESET}}
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    createForm.reset();
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = ({{ENTITY_LOWER}}: {{ENTITY_PASCAL}}) => {
    set{{ENTITY_PASCAL}}ToDelete({{ENTITY_LOWER}});
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if ({{ENTITY_LOWER}}ToDelete) {
      set{{ENTITY_PASCAL}}s({{ENTITY_LOWER}}s.filter(p => p.id !== {{ENTITY_LOWER}}ToDelete!.id));
      setIsDeleteDialogOpen(false);
      set{{ENTITY_PASCAL}}ToDelete(null);
      toast({ variant: 'success', title: '{{ENTITY_TITLE}} eliminado', description: 'Registro eliminado exitosamente.' });
    }
  };

  const handleSaveEdit = async (data: {{ENTITY_CAMEL}}FormData) => {
    if (editing{{ENTITY_PASCAL}}) {
      set{{ENTITY_PASCAL}}s({{ENTITY_LOWER}}s.map(p =>
        p.id === editing{{ENTITY_PASCAL}}!.id ? { ...p, ...data } as {{ENTITY_PASCAL}} : p
      ));
      setIsEditModalOpen(false);
      setEditing{{ENTITY_PASCAL}}(null);
      editForm.reset();
      toast({ variant: 'success', title: '{{ENTITY_TITLE}} actualizado', description: 'Registro actualizado exitosamente.' });
    }
  };

  const handleSaveCreate = async (data: {{ENTITY_CAMEL}}FormData) => {
    const new{{ENTITY_PASCAL}}: {{ENTITY_PASCAL}} = {
      id: Math.max(...{{ENTITY_LOWER}}s.map(p => p.id), 0) + 1,
{{CREATE_FIELDS}}
    };
    set{{ENTITY_PASCAL}}s([...{{ENTITY_LOWER}}s, new{{ENTITY_PASCAL}}]);
    setIsCreateModalOpen(false);
    createForm.reset();
    toast({ variant: 'success', title: '{{ENTITY_TITLE}} creado', description: 'Registro creado exitosamente.' });
  };

  const columns: DataTableColumn<{{ENTITY_PASCAL}}>[] = [
{{COLUMNS}}
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ item }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            <PencilSimple className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{{SECTION_TITLE}}</h1>
          <p className="text-slate-500">Administra los {{ENTITY_LOWER}}s del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo {{ENTITY_TITLE}}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total {{ENTITY_TITLE}}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{{{ENTITY_LOWER}}s.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable<{{ENTITY_PASCAL}}>
        items={{{ENTITY_LOWER}}s}
        columns={columns}
        rowKey={({ item }) => String(item.id)}
        wrapInCard
      />

      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar {{ENTITY_TITLE}}"
        description="Modifica la información del {{ENTITY_LOWER}} seleccionado"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={editForm.handleSubmit(handleSaveEdit)} disabled={editForm.formState.isSubmitting}>Guardar Cambios</Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
{{EDIT_FORM_FIELDS}}
        </form>
      </EditModal>

      <EditModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nuevo {{ENTITY_TITLE}}"
        description="Ingresa la información del nuevo {{ENTITY_LOWER}}"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={createForm.handleSubmit(handleSaveCreate)} disabled={createForm.formState.isSubmitting}>Crear {{ENTITY_TITLE}}</Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleSaveCreate)} className="space-y-4">
{{CREATE_FORM_FIELDS}}
        </form>
      </EditModal>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirmar Eliminación"
        description={\`¿Estás seguro de que deseas eliminar este {{ENTITY_LOWER}}? Esta acción no se puede deshacer.\`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
`;

// Output paths
const VALIDATIONS_DIR = path.join(__dirname, '..', 'src', 'validations');
const PAGES_DIR = path.join(__dirname, '..', 'src', 'pages');
const ROUTES_CONFIG_PATH = path.join(__dirname, '..', 'src', 'config', 'routes.ts');
const NAV_CONFIG_PATH = path.join(__dirname, '..', 'src', 'contexts', 'NavigationConfigContext.tsx');

// Field types mapping
const FIELD_TYPES = {
  string: {
    zod: (name, required) => `  ${name}: z\n    .string()\n    .min(2, '${name} debe tener al menos 2 caracteres')\n    .max(100, '${name} no puede exceder 100 caracteres')${required ? '' : '.optional()'}`,
    type: 'string',
    component: 'ValidatedInput'
  },
  number: {
    zod: (name, required) => `  ${name}: z\n    .number({\n      required_error: '${name} es requerido',\n      invalid_type_error: '${name} debe ser un número',\n    })\n    .min(0, '${name} no puede ser negativo')${required ? '' : '.optional()'}`,
    type: 'number',
    component: 'ValidatedInput'
  },
  email: {
    zod: (name, required) => `  ${name}: z\n    .string()\n    .email('Email inválido')${required ? '' : '.optional()'}`,
    type: 'string',
    component: 'ValidatedInput'
  },
  boolean: {
    zod: (name) => `  ${name}: z.boolean().default(true)`,
    type: 'boolean',
    component: 'ValidatedCheckbox'
  },
  select: {
    zod: (name, required) => `  ${name}: z\n    .string()\n    .min(1, '${name} es requerido')${required ? '' : '.optional()'}`,
    type: 'string',
    component: 'ValidatedSelect'
  },
  textarea: {
    zod: (name, required) => `  ${name}: z\n    .string()\n    .min(10, '${name} debe tener al menos 10 caracteres')\n    .max(500, '${name} no puede exceder 500 caracteres')${required ? '' : '.optional()'}`,
    type: 'string',
    component: 'ValidatedTextarea'
  }
};

// Utility functions
const toCamelCase = (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

const toPascalCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const toLowerCase = (str) => {
  return str.toLowerCase();
};

const toTitleCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

// Generate fields
const generateFields = async () => {
  const fields = [];
  console.log('\nDefine los campos (presiona Enter para terminar):\n');
  
  while (true) {
    const fieldName = await question('Nombre del campo en BD (ej: identity_card): ');
    if (!fieldName) break;
    
    const fieldLabel = await question(`Etiqueta visible (ej: Cédula de Identidad) [Enter = ${toTitleCase(fieldName)}]: `) || toTitleCase(fieldName);
    
    console.log('\nTipos disponibles:');
    console.log('  1. string    - Texto simple');
    console.log('  2. number    - Número');
    console.log('  3. email     - Email');
    console.log('  4. boolean   - Checkbox (true/false)');
    console.log('  5. select    - Selector con opciones');
    console.log('  6. textarea  - Área de texto larga');
    
    const typeChoice = await question('\nSelecciona el tipo (1-6): ');
    const typeMap = { '1': 'string', '2': 'number', '3': 'email', '4': 'boolean', '5': 'select', '6': 'textarea' };
    const fieldType = typeMap[typeChoice] || 'string';
    
    const required = await question('¿Es requerido? (s/n): ');
    const isRequired = required.toLowerCase() === 's';
    
    let options = [];
    if (fieldType === 'select') {
      console.log('\nIngresa las opciones (ejemplo: Electrónica):');
      while (true) {
        const option = await question('Opción (o Enter para terminar): ');
        if (!option) break;
        options.push(option);
      }
    }
    
    fields.push({
      name: fieldName,
      label: fieldLabel,
      type: fieldType,
      required: isRequired,
      options
    });
    
    console.log(`\n✓ Campo "${fieldName}" (${fieldLabel}) agregado\n`);
  }
  
  return fields;
};

// Add route to routes.ts
const addRouteToConfig = (entityName, entityPascal, sectionTitle) => {
  const routesContent = fs.readFileSync(ROUTES_CONFIG_PATH, 'utf8');
  const entityLower = toLowerCase(entityName);
  const entityCamel = toCamelCase(entityName);
  
  // Add import
  const importLine = `const ${entityPascal}CRUD = React.lazy(() => import('@/pages/${entityPascal}CRUD'));`;
  if (!routesContent.includes(importLine)) {
    const importsEndIndex = routesContent.indexOf('const NotFound = React.lazy(() => import');
    if (importsEndIndex !== -1) {
      const beforeImports = routesContent.substring(0, importsEndIndex);
      const afterImports = routesContent.substring(importsEndIndex);
      const updatedContent = beforeImports + importLine + '\n' + afterImports;
      fs.writeFileSync(ROUTES_CONFIG_PATH, updatedContent);
    }
  }
  
  // Add route to routeConfig
  const routeConfig = `  {
    id: '${entityLower}',
    path: '/${entityLower}',
    label: '${sectionTitle}',
    icon: Package,
    component: ${entityPascal}CRUD,
    showInSidebar: true,
  },`;
  
  const updatedRoutesContent = fs.readFileSync(ROUTES_CONFIG_PATH, 'utf8');
  const productsRouteIndex = updatedRoutesContent.indexOf("id: 'products'");
  
  if (productsRouteIndex !== -1 && !updatedRoutesContent.includes(`id: '${entityLower}'`)) {
    const beforeProducts = updatedRoutesContent.substring(0, productsRouteIndex);
    const afterProducts = updatedRoutesContent.substring(productsRouteIndex);
    
    const insertIndex = afterProducts.indexOf('  },');
    if (insertIndex !== -1) {
      const beforeInsert = afterProducts.substring(0, insertIndex + 4);
      const afterInsert = afterProducts.substring(insertIndex + 4);
      const finalContent = beforeProducts + beforeInsert + '\n' + routeConfig + afterInsert;
      fs.writeFileSync(ROUTES_CONFIG_PATH, finalContent);
    }
  }
  
  console.log(`✅ Ruta agregada a routes.ts`);
};

// Add item to MasterSidebar.tsx defaultSidebarItems
const MASTER_SIDEBAR_PATH = path.join(__dirname, '..', 'src', 'components', 'Layout', 'MasterSidebar.tsx');

const addItemToMasterSidebar = (entityName, sectionTitle) => {
  const content = fs.readFileSync(MASTER_SIDEBAR_PATH, 'utf8');
  const entityLower = toLowerCase(entityName);
  
  const newItem = `  {
    id: '${entityLower}',
    label: '${sectionTitle}',
    icon: Package,
    href: '/${entityLower}',
  },`;
  
  // Insert after the products item
  const productsIndex = content.indexOf("id: 'products'");
  if (productsIndex !== -1 && !content.includes(`id: '${entityLower}'`)) {
    const afterProducts = content.substring(productsIndex);
    const insertIndex = afterProducts.indexOf('  },');
    if (insertIndex !== -1) {
      const before = content.substring(0, productsIndex + insertIndex + 4);
      const after = content.substring(productsIndex + insertIndex + 4);
      fs.writeFileSync(MASTER_SIDEBAR_PATH, before + '\n' + newItem + after);
    }
  }
  
  console.log(`✅ Item agregado al MasterSidebar`);
};

// Add navigation item to NavigationConfigContext.tsx
const addNavItemToConfig = (entityName, sectionTitle) => {
  const navContent = fs.readFileSync(NAV_CONFIG_PATH, 'utf8');
  const entityLower = toLowerCase(entityName);
  
  const navItem = `  {
    id: '${entityLower}',
    label: '${sectionTitle}',
    icon: 'Package',
    href: '/${entityLower}',
    enabled: true,
    order: 2,
  },`;
  
  const productsIndex = navContent.indexOf("id: 'products'");
  
  if (productsIndex !== -1 && !navContent.includes(`id: '${entityLower}'`)) {
    const beforeProducts = navContent.substring(0, productsIndex);
    const afterProducts = navContent.substring(productsIndex);
    
    const insertIndex = afterProducts.indexOf('  },');
    if (insertIndex !== -1) {
      const beforeInsert = afterProducts.substring(0, insertIndex + 4);
      const afterInsert = afterProducts.substring(insertIndex + 4);
      const finalContent = beforeProducts + beforeInsert + '\n' + navItem + afterInsert;
      fs.writeFileSync(NAV_CONFIG_PATH, finalContent);
    }
  }
  
  console.log(`✅ Item de navegación agregado a NavigationConfigContext.tsx`);
};

// Generate schema content
const generateSchemaContent = (entityName, fields) => {
  const entityCamel = toCamelCase(entityName);
  
  let fieldsContent = '';
  fields.forEach(field => {
    const fieldConfig = FIELD_TYPES[field.type];
    fieldsContent += fieldConfig.zod(field.name, field.required) + ',\n';
  });
  
  return SCHEMA_TEMPLATE
    .replace(/\{\{ENTITY_CAMEL\}\}/g, entityCamel)
    .replace(/\{\{FIELDS\}\}/g, fieldsContent.trim());
};

// Generate CRUD content
const generateCRUDContent = (entityName, fields, sectionTitle) => {
  const entityCamel = toCamelCase(entityName);
  const entityPascal = toPascalCase(entityName);
  const entityLower = toLowerCase(entityName);
  const entityTitle = toTitleCase(entityName);
  const template = CRUD_TEMPLATE;
  
  // Generate type fields
  let typeFields = '';
  fields.forEach(field => {
    const fieldConfig = FIELD_TYPES[field.type];
    typeFields += `  ${field.name}${field.required ? '' : '?'}: ${fieldConfig.type};\n`;
  });
  
  // Generate default values
  let defaultValues = '';
  fields.forEach(field => {
    const fieldConfig = FIELD_TYPES[field.type];
    if (field.type === 'boolean') {
      defaultValues += `      ${field.name}: true,\n`;
    } else if (field.type === 'number') {
      defaultValues += `      ${field.name}: 0,\n`;
    } else {
      defaultValues += `      ${field.name}: '',\n`;
    }
  });
  
  // Generate edit reset - use the function parameter (entityLower) not the state variable
  let editReset = '';
  fields.forEach(field => {
    if (field.type === 'boolean') {
      editReset += `      ${field.name}: ${entityLower}.${field.name} ?? true,\n`;
    } else if (field.type === 'number') {
      editReset += `      ${field.name}: ${entityLower}.${field.name} ?? 0,\n`;
    } else {
      editReset += `      ${field.name}: ${entityLower}.${field.name} || '',\n`;
    }
  });
  
  // Generate create fields
  let createFields = '';
  fields.forEach(field => {
    createFields += `      ${field.name}: data.${field.name},\n`;
  });
  
  // Generate columns with hideBelow for responsive DataTable
  let columns = '';
  const visibleFields = fields.filter(f => f.name !== 'isActive');
  visibleFields.forEach((field, idx) => {
    const hideBelow = idx >= 2 ? `\n      hideBelow: 'md' as const,\n      mobileLabel: '${field.label}',` : '';
    columns += `    {\n      id: '${field.name}',\n      header: '${field.label}',\n      cell: ({ item }) => <span>{String(item.${field.name})}</span>,${hideBelow}\n    },\n`;
  });
  
  // Generate form fields (used for both create and edit forms with their respective control)
  const generateFormFieldsForControl = (controlName) => {
    let formFields = '';
    fields.forEach(field => {
      const fieldConfig = FIELD_TYPES[field.type];
      const component = fieldConfig.component;
      if (component === 'ValidatedInput') {
        const inputType = field.type === 'number' ? ' type="number" step="1"' : field.type === 'email' ? ' type="email"' : '';
        formFields += `          <${component}\n            label="${field.label}"\n            name="${field.name}"\n            control={${controlName}.control}\n            placeholder="Ej: ..."${inputType}\n            required={${field.required}}\n          />\n\n`;
      } else if (component === 'ValidatedSelect') {
        const options = field.options.map(opt => `                { value: '${opt}', label: '${opt}' }`).join(',\n');
        formFields += `          <${component}\n            label="${field.label}"\n            name="${field.name}"\n            control={${controlName}.control}\n            required={${field.required}}\n            placeholder="Selecciona ${field.label.toLowerCase()}"\n            options={[\n${options}\n            ]}\n          />\n\n`;
      } else if (component === 'ValidatedTextarea') {
        formFields += `          <${component}\n            label="${field.label}"\n            name="${field.name}"\n            control={${controlName}.control}\n            placeholder="Describe..."\n            rows={3}\n          />\n\n`;
      } else if (component === 'ValidatedCheckbox') {
        formFields += `          <${component}\n            label="${field.label}"\n            name="${field.name}"\n            control={${controlName}.control}\n          />\n\n`;
      }
    });
    return formFields;
  };
  const editFormFields = generateFormFieldsForControl('editForm');
  const createFormFields = generateFormFieldsForControl('createForm');
  
  // Generate mock data
  let mockData = '';
  for (let i = 1; i <= 3; i++) {
    mockData += `    { id: ${i}, `;
    fields.forEach((field, idx) => {
      if (field.type === 'boolean') {
        mockData += `${field.name}: true`;
      } else if (field.type === 'number') {
        mockData += `${field.name}: ${Math.floor(Math.random() * 100)}`;
      } else {
        mockData += `${field.name}: '${field.name} ${i}'`;
      }
      if (idx < fields.length - 1) mockData += ', ';
    });
    mockData += ' },\n';
  }
  
  return template
    .replace(/\{\{ENTITY_CAMEL\}\}/g, entityCamel)
    .replace(/\{\{ENTITY_PASCAL\}\}/g, entityPascal)
    .replace(/\{\{ENTITY_LOWER\}\}/g, entityLower)
    .replace(/\{\{ENTITY_TITLE\}\}/g, entityTitle)
    .replace(/\{\{SECTION_TITLE\}\}/g, sectionTitle)
    .replace(/\{\{TYPE_FIELDS\}\}/g, typeFields.trim())
    .replace(/\{\{DEFAULT_VALUES\}\}/g, defaultValues.trim())
    .replace(/\{\{EDIT_RESET\}\}/g, editReset.trim())
    .replace(/\{\{CREATE_FIELDS\}\}/g, createFields.trim())
    .replace(/\{\{COLUMNS\}\}/g, columns.trim())
    .replace(/\{\{MOCK_DATA\}\}/g, mockData.trim())
    .replace(/\{\{EDIT_FORM_FIELDS\}\}/g, editFormFields.trim())
    .replace(/\{\{CREATE_FORM_FIELDS\}\}/g, createFormFields.trim());
};

// Main function
const main = async () => {
  console.log('🚀 Generador de CRUD para Venta Simplyfy\n');
  
  const entityName = await question('Nombre de la entidad (ej: Clientes, Proveedores): ');
  if (!entityName) {
    console.log('❌ Debes ingresar un nombre de entidad');
    rl.close();
    return;
  }
  
  const sectionTitle = await question('Título de la sección (ej: Listado de Clientes): ') || `Listado de ${toTitleCase(entityName)}`;
  
  const fields = await generateFields();
  
  if (fields.length === 0) {
    console.log('❌ Debes definir al menos un campo');
    rl.close();
    return;
  }
  
  console.log('\n📝 Generando archivos...\n');
  
  // Ensure directories exist
  if (!fs.existsSync(VALIDATIONS_DIR)) {
    fs.mkdirSync(VALIDATIONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }
  
  // Generate schema
  const schemaContent = generateSchemaContent(entityName, fields);
  const schemaPath = path.join(VALIDATIONS_DIR, `${toLowerCase(entityName)}.schema.ts`);
  fs.writeFileSync(schemaPath, schemaContent);
  console.log(`✅ Schema generado: ${schemaPath}`);
  
  // Generate CRUD page
  const crudContent = generateCRUDContent(entityName, fields, sectionTitle);
  const crudPath = path.join(PAGES_DIR, `${toPascalCase(entityName)}CRUD.tsx`);
  fs.writeFileSync(crudPath, crudContent);
  console.log(`✅ CRUD generado: ${crudPath}`);
  
  // Add route to config
  addRouteToConfig(entityName, toPascalCase(entityName), sectionTitle);
  
  // Add item to MasterSidebar
  addItemToMasterSidebar(entityName, sectionTitle);
  
  console.log('\n✨ CRUD generado exitosamente!');
  console.log(`\n📝 Archivos creados:`);
  console.log(`   - ${schemaPath}`);
  console.log(`   - ${crudPath}`);
  console.log(`   - Ruta agregada a ${ROUTES_CONFIG_PATH}`);
  console.log(`   - Item de navegación agregado a ${NAV_CONFIG_PATH}`);
  console.log(`\n💡 La nueva opción de menú ya está disponible en el sidebar.`);
  
  rl.close();
};

main().catch(console.error);
