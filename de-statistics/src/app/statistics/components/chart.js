import styles from "@/app/statistics/components/chart.module.css";
import ContextModule from "@/utils/contextModule";
import { Button, TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { BarChart } from "@mui/x-charts/BarChart";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function SimpleCharts({ data, update }) {
  const myContext = React.useContext(ContextModule);
  const { ready } = usePrivy();
  const [selector, setSelector] = useState(0);
  const [checked, setChecked] = useState(true);
  const [dataset, setDataset] = useState({
    bucket: "",
    uploader: "",
    rowKey: "",
    columnKey: "",
    rows: [""],
    columns: [""],
    data: [[0]],
  });

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    if (!checked) {
      myContext.setValue({
        data: {
          uploader: "",
          description: "",
          columns: [""],
          row: [""],
          dbKey: "",
          data: [[0]],
        },
      });
    } else {
      myContext.setValue({
        data: {
          uploader: data.uploader,
          description: data.description,
          columns: data.rows,
          row: data.columns[selector],
          dbKey: data.rowKey,
          data: data.data[selector].map((row) => row),
        },
      });
    }
  }, [selector, checked]);

  useEffect(() => {
    if (JSON.stringify(data) === "{}") return;
    setDataset(data);
    update();
    myContext.setValue({
      data: {
        uploader: data.uploader,
        description: data.description,
        columns: data.rows,
        row: data.columns[selector],
        dbKey: data.columnKey,
        data: data.data[selector].map((row) => row),
      },
    });
  }, [data]);

  useEffect(() => {
    return () => {
      myContext.setValue({
        data: {
          uploader: "",
          description: "",
          columns: [""],
          row: [""],
          dbKey: "",
          data: [[0]],
        },
      });
    };
  }, []);

  return (
    <React.Fragment>
      <div className={styles.headerTitle}>
        {dataset.rowKey}:{" "}
        <Select
          sx={{ color: "black" }}
          labelId="data-select-label"
          id="data-select"
          value={selector}
          onChange={(event) => setSelector(event.target.value)}
        >
          {dataset.columns.map((column, index) => (
            <MenuItem key={index} value={index}>
              {column}
            </MenuItem>
          ))}
        </Select>{" "}
        <FormControlLabel
          className={styles.includeDB}
          control={
            <Checkbox
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
          }
          label="Include DB"
        />
      </div>
      <div className={styles.chartSubContainer}>
        <BarChart
          xAxis={[{ scaleType: "band", data: dataset.rows }]}
          series={[{ data: dataset.data[selector].map((row) => row) }]}
          width={600}
          height={360}
        />
      </div>
    </React.Fragment>
  );
}
