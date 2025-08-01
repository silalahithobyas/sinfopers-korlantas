import { Fragment } from "react";

const TableHead = () => {
  const dspCount = [...Array(14).keys()];

  return (
    <>
      <tr className="bg-blue-800 text-yellow-300">
        <th rowSpan={2} className="text-center px-2">
          No
        </th>
        <th rowSpan={2}>Satker</th>
        <th colSpan={18} className="py-2">
          POLRI
        </th>
        <th colSpan={8}>PNS POLRI</th>
        <th rowSpan={2} colSpan={2}>
          Ket
        </th>
        <th rowSpan={2} />
      </tr>

      <tr className="bg-blue-800 text-yellow-300">
        <th colSpan={2} className="py-2">
          IRJEN
        </th>
        <th colSpan={2} className="py-2">
          BRIGJEN
        </th>
        <th colSpan={2} className="py-2">
          KOMBES
        </th>
        <th colSpan={2} className="py-2">
          AKBP
        </th>
        <th colSpan={2} className="py-2">
          KOMPOL
        </th>
        <th colSpan={2} className="py-2">
          AKP
        </th>
        <th colSpan={2} className="py-2">
          IP
        </th>
        <th colSpan={2} className="py-2">
          BRIGADIR
        </th>
        <th colSpan={2}>Jumlah</th>
        <th colSpan={2}>IV</th>
        <th colSpan={2}>III</th>
        <th colSpan={2}>II/I</th>
        <th colSpan={2}>Jumlah</th>
      </tr>

      <tr className="bg-[#465FB0] text-yellow-300">
        <th colSpan={2} />
        {dspCount.map((_, idx) => {
          return (
            <Fragment key={`dsp-${idx}`}>
              <th className="py-2">DSP</th>
              <th className="py-2">RIIL</th>
            </Fragment>
          );
        })}
        <th />
      </tr>
    </>
  );
};

export default TableHead;
