"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { fetchPayments } from "@/services/payments";
import {
    Payment,
    PaymentMethod,
    PaymentStatus,
    PaymentsSummary,
} from "@/types/payments";
import PaymentsSummaryStrip from "@/features/payments/components/PaymentsSummaryStrip";
import PaymentsFilters from "@/features/payments/components/PaymentsFilters";
import PaymentsTable from "@/features/payments/components/PaymentsTable";
import PaymentsPagination from "@/features/payments/components/PaymentsPagination";
import PaymentsSkeleton from "@/features/payments/components/PaymentsSkeleton";
import PaymentsEmptyState from "@/features/payments/components/PaymentsEmptyState";
import PaymentDetailsPanel from "@/features/payments/components/PaymentDetailsPanel";

export default function PaymentsPage() {
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [status, setStatus] = useState<PaymentStatus | "all">("all");
    const [method, setMethod] = useState<PaymentMethod | "all">("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 3000);

        return () => clearTimeout(timer);
    }, [search]);

    const queryParams = useMemo(
        () => ({
            page,
            pageSize,
            search: debouncedSearch,
            status,
            method,
            dateFrom,
            dateTo,
            ordering: "-payment_date",
        }),
        [page, pageSize, debouncedSearch, status, method, dateFrom, dateTo]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ["payments", queryParams],
        queryFn: () => fetchPayments(queryParams),
    });

    const summaryFallback: PaymentsSummary = {
        total_amount: 0,
        completed_amount: 0,
        pending_amount: 0,
        total_count: 0,
        completed_count: 0,
        pending_count: 0,
        failed_count: 0,
        refunded_count: 0,
    };

    const summary = data?.summary ?? summaryFallback;
    const payments = data?.results ?? [];
    const totalCount = data?.count ?? 0;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: PaymentStatus | "all") => {
        setStatus(value);
        setPage(1);
    };

    const handleMethodChange = (value: PaymentMethod | "all") => {
        setMethod(value);
        setPage(1);
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        setPage(1);
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatus("all");
        setMethod("all");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Payments</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track incoming payments, status, and payment methods
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {isLoading && <PaymentsSkeleton />}

                    {!isLoading && (error || !data) && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load payments</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch payment data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <PaymentsSummaryStrip summary={summary} />

                            <PaymentsFilters
                                search={search}
                                status={status}
                                method={method}
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                onSearchChange={handleSearchChange}
                                onStatusChange={handleStatusChange}
                                onMethodChange={handleMethodChange}
                                onDateFromChange={handleDateFromChange}
                                onDateToChange={handleDateToChange}
                                onReset={handleResetFilters}
                            />

                            {payments.length > 0 ? (
                                <>
                                    <PaymentsTable
                                        payments={payments}
                                        onView={(payment) => setSelectedPayment(payment)}
                                    />
                                    <PaymentsPagination
                                        count={totalCount}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </>
                            ) : (
                                <PaymentsEmptyState
                                    title="No payments found"
                                    description="Try adjusting your filters or date range."
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
            <PaymentDetailsPanel
                payment={selectedPayment}
                onClose={() => setSelectedPayment(null)}
            />
        </AdminLayout>
    );
}
