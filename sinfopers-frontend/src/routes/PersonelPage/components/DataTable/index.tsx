// src/routes/PersonelPage/components/DataTable/index.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Personnel } from "../../hooks/useGetPersonnel/types";
import Action from "./action";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useMemo } from "react";

interface DataTableProps<TData> {
  data: TData[];
}

export function DataTable<TData extends Personnel>({ data }: DataTableProps<TData>) {
  const { hasRole } = useAuth();
  const canEdit = hasRole([UserRole.ADMIN, UserRole.HR]);

  // Definisikan columns di dalam component menggunakan useMemo
  const columns = useMemo(() => {
    const baseColumns: ColumnDef<Personnel, any>[] = [
      {
        id: "number",
        header: "No.",
        cell: ({ row }) => {
          return <h1>{row.index + 1}</h1>;
        },
      },
      {
        accessorKey: "nama",
        header: "Nama",
      },
      {
        accessorKey: "pangkat",
        header: "Pangkat",
      },
      {
        accessorKey: "nrp",
        header: "NRP",
      },
      {
        accessorKey: "jabatan",
        header: "Jabatan",
      },
      {
        accessorKey: "jenis_kelamin",
        header: "Jenis Kelamin",
      },
      {
        accessorKey: "subsatker",
        header: "SubSatKer",
      },
      {
        accessorKey: "subdit",
        header: "SubDit",
      },
      {
        accessorKey: "bko",
        header: "BKO",
        id: "BKO",
        cell: ({ row }) => {
          const personil = row.original;

          switch (personil.bko) {
            case "Gasus Keluar":
            case "Gasus keluar":
              return (
                  <h1 className="bg-stone-400 border text-white text-xs rounded-md px-2 py-0.5">
                    Gasus Keluar
                  </h1>
              );
            case "Gasum Keluar":
            case "Gasum keluar":
              return (
                  <h1 className="bg-stone-500 border text-white text-xs rounded-md px-2 py-0.5">
                    Gasum Keluar
                  </h1>
              );
            case "Gasus Ke Dalam":
            case "Gasus masuk":
              return (
                  <h1 className="bg-lime-700 border  text-white text-xs rounded-md px-2 py-0.5">
                    Gasus Masuk
                  </h1>
              );
            case "Gasum Ke Dalam":
            case "Gasum masuk":
              return (
                  <h1 className="bg-green-800 border text-white text-xs rounded-md px-2 py-0.5">
                    Gasum Masuk
                  </h1>
              );
            default:
              return (
                  <h1 className="bg-slate-800 border text-white text-xs rounded-md px-2 py-0.5">
                    -
                  </h1>
              )
          }
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        id: "status",
        cell: ({ row }) => {
          const personil = row.original;

          switch (personil.status) {
            case "Aktif":
              return (
                  <h1 className="bg-green-100 border border-green-700 text-green-700 text-xs rounded-md px-2 py-0.5">
                    Aktif
                  </h1>
              );
            case "Non Aktif":
              return (
                  <h1 className="bg-red-100 border border-red-700 text-red-700 text-xs rounded-md px-2 py-0.5">
                    Non Aktif
                  </h1>
              );
            case "Cuti":
              return (
                  <h1 className="bg-blue-100 border border-blue-700 text-blue-900 text-xs rounded-md px-2 py-0.5">
                    Cuti
                  </h1>
              );
            case "Pensiun":
              return (
                  <h1 className="bg-yellow-100 border border-yellow-700 text-yellow-700 text-xs rounded-md px-2 py-0.5">
                    Pensiun
                  </h1>
              );
          }

          return <h1 className="text-black">{personil.status}</h1>;
        },
      },
    ];

    // Tambahkan kolom actions hanya jika user memiliki hak akses
    if (canEdit) {
      baseColumns.push({
        id: "actions",
        cell: ({ row }) => {
          const personil = row.original;
          return <Action personnel={personil} />;
        },
      });
    }

    return baseColumns;
  }, [canEdit]); // Dependency canEdit untuk memastikan columns diperbarui jika role berubah

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
      <div className="mt-4 mb-8 w-full">
        <Table>
          <TableHeader className="bg-blue-800">
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="rounded-xl" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                        <TableHead className="text-yellow-300 font-bold" key={header.id}>
                          {!header.isPlaceholder &&
                              flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                              )}
                        </TableHead>
                    );
                  })}
                </TableRow>
            ))}
          </TableHeader>

          <TableBody className="bg-neutral-50">
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                      ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
  );
}