import * as React from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { LogoOverlayInline } from "@/components/ui/LogoOverlayInline";

// ---------------------------------------------------------------------------
// Breakpoint helpers
// ---------------------------------------------------------------------------
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;
type HideBelow = keyof typeof BREAKPOINTS;

/** Tailwind classes that hide a table cell below the given breakpoint */
const HIDE_CELL_CLASS: Record<HideBelow, string> = {
  "sm":  "hidden sm:table-cell",
  "md":  "hidden md:table-cell",
  "lg":  "hidden lg:table-cell",
  "xl":  "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
};

function useWindowWidth(): number {
  const [width, setWidth] = React.useState(
    () => (typeof window !== "undefined" ? window.innerWidth : 1280)
  );
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (args: { item: T; index: number }) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  /**
   * Hide this column on screens narrower than the given breakpoint.
   * The column data will be shown inside the expanded row instead.
   */
  hideBelow?: HideBelow;
  /**
   * Label shown in the expanded row for this column.
   * Defaults to the `header` text when it is a string.
   */
  mobileLabel?: string;
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

  /**
   * Optional extra content rendered at the bottom of the expanded row,
   * after any auto-collapsed column values.
   */
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
  const windowWidth = useWindowWidth();

  const canExpand = typeof renderExpanded === "function";

  /** Columns currently hidden due to responsive breakpoints */
  const hiddenColumns = React.useMemo(
    () =>
      columns.filter(
        (col) => col.hideBelow && windowWidth < BREAKPOINTS[col.hideBelow]
      ),
    [columns, windowWidth]
  );

  /** Show the toggle chevron when there are hidden columns or a custom expand fn */
  const showToggle = hiddenColumns.length > 0 || canExpand;

  const baseTableClass = "min-w-full text-sm text-slate-800";
  const headCellBaseClass =
    "text-xs font-bold uppercase tracking-wide text-[#0f2f57] py-3 bg-slate-50";
  const bodyCellBaseClass = "py-3 text-slate-900";
  const headRowClass = "bg-slate-50";
  const bodyRowClass =
    "align-top border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors duration-150 ease-out";

  const content = (
    <>
      <div className={desktopWrapperClassName || "overflow-x-auto"}>
        <Table className={`${baseTableClass} ${tableClassName || ""}`}>
          <TableHeader>
            <TableRow className={headRowClass}>
              {/* Toggle header cell – only takes space when there's something to expand */}
              {showToggle && (
                <TableHead className={`${headCellBaseClass} w-8 text-center`} />
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={[
                    headCellBaseClass,
                    col.hideBelow ? HIDE_CELL_CLASS[col.hideBelow] : "",
                    col.headerClassName || "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
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
                  {/* ── Main row ─────────────────────────────────────── */}
                  <TableRow className={bodyRowClass}>
                    {showToggle && (
                      <TableCell className={`${bodyCellBaseClass} w-8 text-center`}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Contraer fila" : "Expandir fila"}
                          onClick={() =>
                            setExpandedKey((prev) =>
                              prev === keyBase ? null : keyBase
                            )
                          }
                          className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
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
                      <TableCell
                        key={col.id}
                        className={[
                          bodyCellBaseClass,
                          col.hideBelow ? HIDE_CELL_CLASS[col.hideBelow] : "",
                          col.cellClassName || "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {col.cell({ item, index })}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* ── Expanded row ─────────────────────────────────── */}
                  {isExpanded && (
                    <TableRow className="bg-slate-50/70 border-b border-slate-100">
                      {/* empty cell under the chevron column */}
                      {showToggle && <TableCell className="py-0" />}
                      <TableCell
                        colSpan={
                          columns.filter(
                            (col) =>
                              !col.hideBelow ||
                              windowWidth >= BREAKPOINTS[col.hideBelow]
                          ).length
                        }
                        className="py-3 px-4"
                      >
                        {/* Auto-collapsed column values */}
                        {hiddenColumns.length > 0 && (
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                            {hiddenColumns.map((col) => {
                              const label =
                                col.mobileLabel ??
                                (typeof col.header === "string"
                                  ? col.header
                                  : col.id);
                              return (
                                <React.Fragment key={col.id}>
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide self-center whitespace-nowrap">
                                    {label}
                                  </span>
                                  <span className="text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                                    {col.cell({ item, index })}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* Optional custom expanded content */}
                        {canExpand && (
                          <div
                            className={
                              hiddenColumns.length > 0 ? "mt-3" : undefined
                            }
                          >
                            {renderExpanded({ item, index })}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {renderMobileCard ? (
        <div
          className={
            mobileCardContainerClassName ||
            "sm:hidden mt-2 max-h-[60vh] overflow-auto space-y-3"
          }
        >
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
        <Card
          className={`p-0 border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${
            cardClassName || ""
          }`}
        >
          {content}
        </Card>
      ) : (
        content
      )}
    </div>
  );
}
