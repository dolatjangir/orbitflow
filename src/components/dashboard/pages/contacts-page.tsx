

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

    Eye,

  Star,

  Thermometer,

  ChevronDown,

} from "lucide-react";



import type { Contact } from "@/types/contact";

import { PageHeader } from "@/components/ui/dashboard/page-header";

import { MetricCard } from "@/components/ui/dashboard/metric-card";

import { getCustomers,  updateCustomer,

  type CustomerActionPayload, } from "@/services/customerService";

import { Modal } from "@/components/ui/modal";



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

  "\_id",

  "\_count",

  "updatedat",

  "createdat",

  "isimported",

  "createdbyid",

  "clientid",

  "isfavourite",

  "ischecked",

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

const [selectedLead, setSelectedLead] = useState<Customer | null>(null);

  const [savingActionIds, setSavingActionIds] = useState<

  Record<string, boolean>

>({});

const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);



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





  const saveLeadAction = async (

  customerId: string,

  payload: CustomerActionPayload

) => {

  if (savingActionIds[customerId]) return;



  setSavingActionIds((previous) => ({

    ...previous,

    [customerId]: true,

  }));



  setError("");



  try {

    // Save to your existing PUT endpoint.

    await updateCustomer(customerId, payload);



    // Update the table only after a successful response.

    setCustomers((previous) =>

      previous.map((customer) =>

        customer.id === customerId

          ? { ...customer, ...payload }

          : customer

      )

    );



    // Keep the details popup in sync when it is open.

    setSelectedLead((previous) =>

      previous?.id === customerId

        ? { ...previous, ...payload }

        : previous

    );

  } catch (err) {

    setError(

      err instanceof Error

        ? err.message

        : "Unable to save the lead changes."

    );

  } finally {

    setSavingActionIds((previous) => {

      const next = { ...previous };

      delete next[customerId];

      return next;

    });

  }

};



const handleToggleFavourite = (customer: Customer) => {

  return saveLeadAction(customer.id, {

    isFavourite: !customer.isFavourite,

  });

};



const handleTemperatureChange = (

  customerId: string,

  temperature: string

) => {

  if (!["hot", "warm", "cold"].includes(temperature)) {

    return Promise.resolve();

  }



  return saveLeadAction(customerId, {

    LeadTemperature: temperature as "hot" | "warm" | "cold",

  });

};



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



  const toggleLeadSelection = (id: string) => {

  setSelectedLeadIds((prev) =>

    prev.includes(id)

      ? prev.filter((selectedId) => selectedId !== id)

      : [...prev, id]

  );

};



const toggleSelectAll = (leadIds: string[]) => {

  setSelectedLeadIds((prev) => {

    const allSelected = leadIds.every((id) =>

      prev.includes(id)

    );



    if (allSelected) {

      return prev.filter((id) => !leadIds.includes(id));

    }



    return [...new Set([...prev, ...leadIds])];

  });

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



        <div className="customer-table-scroll relative isolate w-full max-w-full overflow-x-auto">

          <table className="customer-data-table w-max min-w-full border-separate border-spacing-0">

            <thead>



              <tr>

                <th className="sticky! top-0 left-0 z-40! w-12 min-w-12 border-b border-r border-(--border) bg-(--surface-2) px-4 py-3">
<input

  type="checkbox"

  checked={

    customers.length > 0 &&

    customers.every((customer) =>

      selectedLeadIds.includes(customer.id)

    )

  }

  onChange={(event) => {

    const isChecked = event.target.checked;



    setSelectedLeadIds((prev) => {

      const currentPageIds = customers.map((customer) => customer.id);



      if (isChecked) {

        return [...new Set([...prev, ...currentPageIds])];

      }



      return prev.filter((id) => !currentPageIds.includes(id));

    });

  }}

  disabled={customers.length === 0}

  className="h-4 w-4 cursor-pointer accent-blue-600"

/>

</th>

              <th className="sticky! top-0 left-12 z-40! w-[72px] min-w-[72px] border-b border-r border-(--border) bg-(--surface-2) px-2 py-3">


                  S.No.



                  </th>



                {columns.map((column) => (

                  <th key={column}>{column}</th>

                ))}



          <th className="sticky right-0 z-40 min-w-[110px] border-b border-l border-(--border) bg-(--surface-2) px-4 py-3 text-right">

  Actions

</th>

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

                    <td className="sticky left-0 z-20 min-w-12 border-b border-r border-(--border) bg-(--surface) px-4 py-3">

  <input

    type="checkbox"

    aria-label={`Select ${customer.customerName || customer.id}`}

    checked={selectedLeadIds.includes(customer.id)}

    onChange={() => toggleLeadSelection(customer.id)}

    className="h-4 w-4 cursor-pointer accent-blue-600"

  />

</td>

                    {/* Serial number continues across pages */}

                 <td className="sticky left-12 z-20 min-w-[72px] border-b border-r border-(--border) bg-(--surface) px-4 py-3">

            {page * limit + rowIndex + 1}

            </td>



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

                                        target="\_blank"

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





                  <td className="sticky right-0 z-20 w-[136px] min-w-[136px] border-b border-l border-(--border) bg-white! px-3 py-3 align-middle dark:bg-[#0f172a]!">
  <div className="flex items-center justify-center gap-2">
    {/* View */}
    <button
      type="button"
      title="View lead"
      aria-label="View lead"
      onClick={() => setSelectedLead(customer)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border) text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Eye size={16} />
    </button>

    {/* Favourite */}
    <button
      type="button"
      title={
        customer.isFavourite
          ? "Remove from favourites"
          : "Add to favourites"
      }
      aria-label={
        customer.isFavourite
          ? "Remove from favourites"
          : "Add to favourites"
      }
      aria-pressed={Boolean(customer.isFavourite)}
      disabled={Boolean(savingActionIds[customer.id])}
      onClick={() => void handleToggleFavourite(customer)}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border) transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        customer.isFavourite
          ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-800"
          : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <Star
        size={16}
        fill={customer.isFavourite ? "currentColor" : "none"}
      />
    </button>

{/* Temperature button */}
<button
  type="button"
  popoverTarget={`temperature-menu-${customer.id}`}
  aria-label={`Change temperature for ${
    customer.customerName || "lead"
  }`}
  title={`Temperature: ${customer.LeadTemperature || "cold"}`}
  disabled={Boolean(savingActionIds[customer.id])}
  onClick={(event) => {
    const menu = document.getElementById(
      `temperature-menu-${customer.id}`
    );

    if (!menu) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 144;
    const menuHeight = 134;

    // Position the menu beside this row's temperature button.
    const left = Math.max(
      8,
      Math.min(
        rect.right - menuWidth,
        window.innerWidth - menuWidth - 8
      )
    );

    const top =
      rect.bottom + menuHeight + 8 <= window.innerHeight
        ? rect.bottom + 6
        : Math.max(8, rect.top - menuHeight - 6);

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }}
  className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--border) transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
>
  <span aria-hidden="true" className="text-base leading-none">
    {customer.LeadTemperature?.toLowerCase() === "hot"
      ? "🔥"
      : customer.LeadTemperature?.toLowerCase() === "warm"
        ? "☀️"
        : "❄️"}
  </span>
</button>

{/* Custom dropdown: displayed in the browser's top layer */}
<div
  id={`temperature-menu-${customer.id}`}
  popover="auto"
  className="fixed inset-auto m-0 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
>
  {[
    { value: "hot", label: "Hot", icon: "🔥" },
    { value: "warm", label: "Warm", icon: "☀️" },
    { value: "cold", label: "Cold", icon: "❄️" },
  ].map((option) => (
    <button
      key={option.value}
      type="button"
      disabled={Boolean(savingActionIds[customer.id])}
      onClick={(event) => {
        event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover();

        void handleTemperatureChange(customer.id, option.value);
      }}
      className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 ${
        (customer.LeadTemperature?.toLowerCase() || "cold") ===
        option.value
          ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <span aria-hidden="true" className="text-base">
        {option.icon}
      </span>
      <span>{option.label}</span>
    </button>
  ))}
</div>
  </div>
</td>



                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>



     <div className="flex w-full flex-nowrap items-center justify-between gap-4 overflow-x-auto whitespace-nowrap px-4 py-3">
  <span className="panel-description shrink-0">
    Showing {customers.length ? page * limit + 1 : 0}–
    {page * limit + customers.length} of {totalRecords}
  </span>

  <div className="flex shrink-0 flex-nowrap items-center gap-2">
    <select
      className="select w-auto! shrink-0"
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
      className="button button-outline shrink-0 whitespace-nowrap"
      disabled={page === 0 || loading}
      onClick={() => setPage((previous) => previous - 1)}
    >
      <ChevronLeft size={14} />
      Previous
    </button>

    <button
      className="button button-outline shrink-0 whitespace-nowrap"
      disabled={
        loading ||
        customers.length < limit ||
        (totalRecords > 0 && (page + 1) * limit >= totalRecords)
      }
      onClick={() => setPage((previous) => previous + 1)}
    >
      Next
      <ChevronRight size={14} />
    </button>
  </div>
</div>

      </div>



<Modal

  open={Boolean(selectedLead)}

  title={selectedLead?.customerName || "Lead details"}

  subtitle={

    selectedLead

      ? String(

          selectedLead.Email ||

            selectedLead.ContactNumber ||

            "Complete customer profile"

        )

      : ""

  }

  onClose={() => setSelectedLead(null)}

  wide

  footer={

    <button

      type="button"

      className="button button-secondary"

      onClick={() => setSelectedLead(null)}

    >

      Close

    </button>

  }

>

  {selectedLead && (

    <div className="form-stack">

      {/* Lead summary */}

      <div className="section-panel panel-padding">

        <div className="panel-heading-main">

          <div className="panel-icon">

            <ContactRound size={20} />

          </div>



          <div className="min-w-0">

            <h3 className="panel-title">

              {selectedLead.customerName || "Unnamed lead"}

            </h3>



            <p className="panel-description">

              {String(selectedLead.CompanyName || "No company specified")}

            </p>

          </div>

        </div>



        <div className="form-grid" style={{ marginTop: 16 }}>

          <div>

            <div className="field-label">Contact number</div>

            <div className="break-words">

              {formatValue(selectedLead.ContactNumber)}

            </div>

          </div>



          <div>

            <div className="field-label">Email</div>

            <div className="break-words">

              {formatValue(selectedLead.Email)}

            </div>

          </div>



          <div>

            <div className="field-label">Lead temperature</div>

            <div>{formatValue(selectedLead.LeadTemperature)}</div>

          </div>



          <div>

            <div className="field-label">Favourite</div>

            <div>{formatValue(selectedLead.isFavourite)}</div>

          </div>

        </div>

      </div>



      {/* All returned fields, excluding the password */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {Object.entries(selectedLead)

          .filter(([key]) => key.toLowerCase() !== "password")

          .filter(

            ([key]) =>

              ![

                "customername",

                "companyname",

                "contactnumber",

                "email",

                "leadtemperature",

                "isfavourite",

              ].includes(key.toLowerCase())

          )

          .map(([key, value]) => (

            <div

              key={key}

              className="section-panel panel-padding min-w-0"

            >

              <div className="field-label">

                {key

                  .replace(/^\_+/, "")

                  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")

                  .replace(/\_/g, " ")

                  .replace(/\b\w/g, (char) => char.toUpperCase())}

              </div>



              <div

                className="break-words"

                style={{

                  marginTop: 8,

                  overflowWrap: "anywhere",

                }}

              >

                {Array.isArray(value) ? (

                  value.length ? (

                    <div className="flex flex-col gap-2">

                      {value.map((item: unknown, index: number) => (

                        <div key={index}>

                          {typeof item === "string" &&

                          /^https?:\/\//i.test(item) ? (

                            <a

                              href={item}

                              target="\_blank"

                              rel="noreferrer"

                              className="text-blue-600 underline dark:text-blue-400"

                            >

                              Open item {index + 1}

                            </a>

                          ) : typeof item === "object" &&

                            item !== null ? (

                            <pre className="whitespace-pre-wrap break-words text-xs">

                              {JSON.stringify(item, null, 2)}

                            </pre>

                          ) : (

                            formatValue(item)

                          )}

                        </div>

                      ))}

                    </div>

                  ) : (

                    "—"

                  )

                ) : typeof value === "string" &&

                  /^https?:\/\//i.test(value) ? (

                  <a

                    href={value}

                    target="\_blank"

                    rel="noreferrer"

                    className="text-blue-600 underline dark:text-blue-400"

                  >

                    Open link

                  </a>

                ) : typeof value === "object" && value !== null ? (

                  <pre className="whitespace-pre-wrap break-words text-xs">

                    {JSON.stringify(value, null, 2)}

                  </pre>

                ) : (

                  formatValue(value)

                )}

              </div>

            </div>

          ))}

      </div>

    </div>

  )}

</Modal>



    </>

  );

}
