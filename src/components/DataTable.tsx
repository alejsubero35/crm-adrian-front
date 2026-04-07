import * as React from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { LogoOverlayInline } from "@/components/ui/LogoOverlayInline";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (args: { item: T; index: number }) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export interface DataTableProps<T> {
  items: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey: (args: { item: T; index: number }) => string;

  overlay?: boolean;
  overlayContent?: React.ReactNode;
  overlayUseLogo?: boolean;
  overlayTitle?: string;
  overlayMessage?: string;

  renderExpanded?: (args: { item: T; index: number }) => React.ReactNode;

  renderMobileCard?: (args: { item: T; index: number }) => React.ReactNode;
  mobileCardContainerClassName?: string;

  wrapInCard?: boolean;
  desktopWrapperClassName?: string;

  hasMore?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement>;
  sentinelClassName?: string;

  tableClassName?: string;
  containerClassName?: string;
  cardClassName?: string;
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    items,
    columns,
    rowKey,
    overlay = false,
    overlayContent,
    overlayUseLogo = false,
    overlayTitle,
    overlayMessage,
    renderExpanded,
    renderMobileCard,
    mobileCardContainerClassName,
    wrapInCard = true,
    desktopWrapperClassName,
    hasMore,
    sentinelRef,
    sentinelClassName,
    tableClassName,
    containerClassName,
    cardClassName,
  } = props;

  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);

  const canExpand = typeof renderExpanded === "function";

  const baseTableClass = "min-w-full text-sm text-slate-800";
  const headCellBaseClass = "text-xs font-bold uppercase tracking-wide text-[#0f2f57] py-3 bg-slate-50";
  const bodyCellBaseClass = "py-3 text-slate-900";
  const headRowClass = "bg-slate-50";
  const bodyRowClass = "align-top border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors duration-250 ease-out";

  const content = (
    <>
      <div className={desktopWrapperClassName || "overflow-hidden hidden sm:block"}>
          <Table className={`${baseTableClass} ${tableClassName || ""}`}>
            <TableHeader>
              <TableRow className={headRowClass}>
                {canExpand && <TableHead className={`${headCellBaseClass} w-8 2xl:hidden text-center`} />}
                {columns.map((col) => (
                  <TableHead key={col.id} className={`${headCellBaseClass} ${col.headerClassName || ""}`}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const keyBase = rowKey({ item, index });
                const isExpanded = expandedKey === keyBase;

                return (
                  <React.Fragment key={keyBase}>
                    <TableRow className={bodyRowClass}>
                      {canExpand && (
                        <TableCell className={`${bodyCellBaseClass} w-8 2xl:hidden text-center`}> 
                          <button
                            type="button"
                            onClick={() => setExpandedKey((prev) => (prev === keyBase ? null : keyBase))}
                            className="flex items-center justify-center text-gray-500 hover:text-gray-800"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                      )}

                      {columns.map((col) => (
                        <TableCell key={col.id} className={`${bodyCellBaseClass} ${col.cellClassName || ""}`}>
                          {col.cell({ item, index })}
                        </TableCell>
                      ))}
                    </TableRow>

                    {canExpand && isExpanded ? (
                      <TableRow className="bg-muted/40 2xl:hidden">
                        <TableCell />
                        <TableCell colSpan={columns.length} className="p-3">
                          {renderExpanded({ item, index })}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {renderMobileCard ? (
          <div className={mobileCardContainerClassName || "sm:hidden mt-2 max-h-[60vh] overflow-auto space-y-3"}>
            {items.map((item, index) => (
              <React.Fragment key={`${rowKey({ item, index })}-mobile`}>
                {renderMobileCard({ item, index })}
              </React.Fragment>
            ))}
          </div>
        ) : null}

        {!!hasMore && sentinelRef ? (
          <div
            ref={sentinelRef as unknown as React.RefObject<HTMLDivElement>}
            aria-hidden
            className={sentinelClassName || "h-1 w-full"}
            style={{ minHeight: 1 }}
          />
        ) : null}
    </>
  );

  return (
    <div className={containerClassName}>
      {overlay ? (
        overlayContent ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            {overlayContent}
          </div>
        ) : overlayUseLogo ? (
          <LogoOverlayInline
            open
            title={overlayTitle || "BUSCANDO"}
            message={overlayMessage || "Buscando, por favor espere..."}
          />
        ) : (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="text-sm text-gray-600">Cargando...</div>
          </div>
        )
      ) : null}

      {wrapInCard ? (
        <Card className={`p-0 border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${cardClassName || ""}`}>
          {content}
        </Card>
      ) : (
        content
      )}
    </div>
  );
}
