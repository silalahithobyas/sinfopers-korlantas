import { Satker } from "../../types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";
import TableHead from "./TableHead";
import { Info } from "lucide-react";

interface Props {
  data: Satker[];
}

const Table = ({ data }: Props) => {
  return (
    <div className="w-full py-11">
      <table className="w-full border-2 rounded-lg">
        <TableHead />
        <TableBody data={data} />
        <TableFooter />
      </table>
      
      {/* Keterangan tabel */}
      <div className="mt-4 p-4 bg-neutral-50 rounded-lg border text-sm">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Keterangan:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><span className="text-red-500 font-bold">Angka berwarna merah</span> menandakan adanya ketidaksesuaian antara DSP (Daftar Susunan Personel) dan jumlah RIIL personel.</li>
              <li>Warna merah bisa menandakan <span className="font-semibold">kelebihan personel</span> (jumlah RIIL &gt; DSP) atau <span className="font-semibold">kekurangan personel</span> (jumlah RIIL &lt; DSP).</li>
              <li>Untuk mengetahui detail kelebihan/kekurangan, silakan <span className="font-semibold">hover pada angka DSP</span> yang berwarna merah atau klik angka tersebut untuk informasi lebih lanjut.</li>
              <li>Latar belakang <span className="bg-red-100 px-2 py-0.5 rounded">merah muda</span> juga digunakan untuk menandai sel dengan ketidaksesuaian jumlah personel.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <ReactTooltip
        id="over-tooltip"
        place="bottom-start"
        variant="error"
        content="Kelebihan Personil"
      />
      <ReactTooltip
        id="under-tooltip"
        place="bottom"
        variant="error"
        content="Kekurangan Personil"
      />
    </div>
  );
};

export default Table;
