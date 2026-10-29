
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ContactRound,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import type { Contact } from "@/types/contact";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import { MetricCard } from "@/components/ui/dashboard/metric-card";
import { getCustomers } from "@/services/customerService";

type PageMeta = {
  title: string;
  subtitle: string;
  eyebrow: string;
};

type Props = {
  meta: PageMeta;
  onExport: () => void;
  onAddContact: () => void;
  onSelectContact: (contact: Contact) => void;
};

type Customer = Record<string, unknown> & {
  id: string;
  customerName?: string;
  ContactNumber?: string;
  Email?: string;
  LeadTemperature?: string;
  isFavourite?: boolean;
};

type Filters = {
  City: string;
  Location: string;
  CustomerType: string;
  LeadType: string;
  LeadTemperature: string;
  Campaign: string;
  MinPrice: string;
  MaxPrice: string;
  StartDate: string;
  EndDate: string;
  isFavourite: string;
};

const initialFilters: Filters = {
  City: "",
  Location: "",
  CustomerType: "",
  LeadType: "",
  LeadTemperature: "",
  Campaign: "",
  MinPrice: "",
  MaxPrice: "",
  StartDate: "",
  EndDate: "",
  isFavourite: "",
};

// These fields will not appear in the table or CSV export.
// Comparison is case-insensitive.
const hiddenFields = new Set([
  "password",
  "id",
  "_id",
  "_count",
  "updatedat",
  "createdat",
  "isimported",
  "createdbyid",
  "clientid",
]);

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => formatValue(item)).join(", ")
      : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function ContactsPage({
  meta,
  onAddContact,
  onSelectContact,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query: Record<string, string | number | boolean> = {
        Limit: limit,
        Skip: page * limit,
      };

      if (searchValue.trim()) {
        query.Keyword = searchValue.trim();
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value === "") return;

        if (key === "isFavourite") {
          query[key] = value === "true";
        } else {
          query[key] = value;
        }
      });

      const result = await getCustomers(
        query as Parameters<typeof getCustomers>[0]
      );

      setCustomers(result.customers as Customer[]);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      setCustomers([]);
      setTotalRecords(0);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page, searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setPage(0);

    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchValue("");
    setPage(0);
  };

  // Use the API fields dynamically, excluding hidden columns.
  const columns = Array.from(
    new Set(customers.flatMap((customer) => Object.keys(customer)))
  ).filter((key) => !hiddenFields.has(key.toLowerCase()));

  const favouriteCount = customers.filter(
    (customer) => customer.isFavourite === true
  ).length;

  const coldLeads = customers.filter(
    (customer) =>
      customer.LeadTemperature?.toLowerCase() === "cold"
  ).length;

  const exportCurrentPage = () => {
    if (!customers.length) return;

    // Uses the same visible and safe fields as the table.
    const csvColumns = columns;

    const escapeCSV = (value: unknown) =>
      `"${formatValue(value).replace(/"/g, '""')}"`;

    const csv = [
      csvColumns.map(escapeCSV).join(","),
      ...customers.map((customer) =>
        csvColumns
          .map((column) => escapeCSV(customer[column]))
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `customers-page-${page + 1}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const field = (
    label: string,
    key: keyof Filters,
    placeholder = "All"
  ) => (
    <label className="filter-field" key={key}>
      <span className="filter-label">{label}</span>

      <input
        className="input"
        value={filters[key]}
        placeholder={placeholder}
        onChange={(event) =>
          updateFilter(key, event.target.value)
        }
      />
    </label>
  );

  const selectField = (
    label: string,
    key: keyof Filters,
    options: string[]
  ) => (
    <label className="filter-field" key={key}>
      <span className="filter-label">{label}</span>

      <select
        className="select"
        value={filters[key]}
        onChange={(event) =>
          updateFilter(key, event.target.value)
        }
      >
        <option value="">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        subtitle={meta.subtitle}
        actions={
          <>
            <button
              className="button button-outline"
              onClick={exportCurrentPage}
              disabled={!customers.length}
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              className="button button-primary"
              onClick={onAddContact}
            >
              <Plus size={14} />
              Add contact
            </button>
          </>
        }
      />

      <div className="stats-grid">
        <MetricCard
          label="Total matching contacts"
          value={totalRecords.toLocaleString()}
          detail="Matching records reported by API"
          icon={Users}
        />

        <MetricCard
          label="Favourite contacts"
          value={String(favouriteCount)}
          detail="On the current page"
          icon={CheckCircle2}
        />

        <MetricCard
          label="Cold leads"
          value={String(coldLeads)}
          detail="On the current page"
          icon={Activity}
        />

        <MetricCard
          label="Loaded this page"
          value={String(customers.length)}
          detail={`Page ${page + 1} · ${limit} per page`}
          icon={ContactRound}
          accent
        />
      </div>

      <div className="section-panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">All contacts</h2>

            <p className="panel-description">
              Search, filter and review customer records
            </p>
          </div>

          <div className="table-toolbar-right">
            <div className="search-field">
              <Search size={14} />

              <input
                className="input"
                aria-label="Search customers"
                placeholder="Search customers..."
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setPage(0);
                }}
              />
            </div>

            <button
              type="button"
              className="button button-outline"
              onClick={() =>
                setShowAdvanced((value) => !value)
              }
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            <button
              type="button"
              className="button button-outline"
              onClick={() => void fetchCustomers()}
              disabled={loading}
              aria-label="Refresh customers"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="advanced-filters-heading">
              <h3 className="panel-title">Advanced filters</h3>

              <button
                type="button"
                className="button button-outline"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

            <div className="advanced-filters-grid">
              {field("City", "City", "Enter city")}
              {field("Location", "Location", "Enter location")}

              {field(
                "Customer type",
                "CustomerType",
                "Enter type"
              )}

              {field(
                "Lead type",
                "LeadType",
                "Enter lead type"
              )}

              {field("Campaign", "Campaign", "Enter campaign")}

              {selectField("Lead temperature", "LeadTemperature", [
                "hot",
                "warm",
                "cold",
              ])}

              {selectField("Favourite", "isFavourite", [
                "true",
                "false",
              ])}

              {field(
                "Minimum price",
                "MinPrice",
                "Minimum price"
              )}

              {field(
                "Maximum price",
                "MaxPrice",
                "Maximum price"
              )}

              <label className="filter-field">
                <span className="filter-label">Start date</span>

                <input
                  className="input"
                  type="date"
                  value={filters.StartDate}
                  onChange={(event) =>
                    updateFilter("StartDate", event.target.value)
                  }
                />
              </label>

              <label className="filter-field">
                <span className="filter-label">End date</span>

                <input
                  className="input"
                  type="date"
                  value={filters.EndDate}
                  onChange={(event) =>
                    updateFilter("EndDate", event.target.value)
                  }
                />
              </label>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="table-error">
            <p>{error}</p>

            <button
              className="button button-outline"
              onClick={() => void fetchCustomers()}
            >
              Retry
            </button>
          </div>
        )}

        <div className="customer-table-scroll">
          <table className="customer-data-table">
            <thead>
              <tr>
                <th>S.No.</th>

                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2}>
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                customers.map((customer, rowIndex) => (
                  <tr key={customer.id}>
                    {/* Serial number continues across pages */}
                    <td>{page * limit + rowIndex + 1}</td>

                    {columns.map((column) => {
                      const value = customer[column];

                      return (
                        <td
                          key={column}
                          title={formatValue(value)}
                        >
                          {column === "CustomerImage" ||
                          column === "SitePlan" ? (
                            Array.isArray(value) &&
                            value.length > 0 ? (
                              value.map(
                                (item: unknown, index: number) => (
                                  <span key={index}>
                                    {typeof item === "string" &&
                                    /^https?:\/\//i.test(item) ? (
                                      <a
                                        href={item}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View {index + 1}
                                      </a>
                                    ) : (
                                      formatValue(item)
                                    )}

                                    {index < value.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                )
                              )
                            ) : (
                              "—"
                            )
                          ) : (
                            formatValue(value)
                          )}
                        </td>
                      );
                    })}

                    <td>
                      <button
                        className="button button-outline"
                        onClick={() =>
                          onSelectContact(
                            customer as unknown as Contact
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="customer-table-pagination">
          <span className="panel-description">
            Showing {customers.length ? page * limit + 1 : 0}–
            {page * limit + customers.length} of {totalRecords}
          </span>

          <div className="table-toolbar-right">
            <select
              className="select"
              aria-label="Rows per page"
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(0);
              }}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            <button
              className="button button-outline"
              disabled={page === 0 || loading}
              onClick={() =>
                setPage((previous) => previous - 1)
              }
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              className="button button-outline"
              disabled={
                loading ||
                customers.length < limit ||
                (totalRecords > 0 &&
                  (page + 1) * limit >= totalRecords)
              }
              onClick={() =>
                setPage((previous) => previous + 1)
              }
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
