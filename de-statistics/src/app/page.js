"use client";
import { getAllDBs, updateDB } from "@/actions/fetchDataset";
import styles from "@/app/page.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

export default function Main() {
  const [data, setData] = useState([{ title: "" }]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  const setupDBs = async () => {
    await updateDB(); // update DB
    try {
      const res = await getAllDBs();
      setData(res);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setupDBs();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>
          Empowering <span className={styles.titleSoft}>human knowledge</span>
        </div>
        <div className={styles.titleMiniSoft}>
          through decentralization and cutting-edge AI
        </div>
      </div>

      <div className={styles.searchBarContainer}>
        <Autocomplete
          onChange={(_, value) => {
            if (value) {
              setSelected(data.filter((item) => item.title === value)[0].key);
            } else {
              setSelected(null);
            }
          }}
          className={styles.searchBar}
          id="autocomplete"
          freeSolo
          options={data.map((option) => option.title)}
          renderInput={(params) => (
            <TextField {...params} label={loading ? "Loading..." : "Search"} />
          )}
        />
        <button
          onClick={() => {
            if (selected) {
              window.location.href = `/statistics?db=${selected}`;
            }
          }}
          className={styles.searchButton}
        >
          Search
        </button>
      </div>
      <div className={styles.buttonsContainer}>
        {data.slice(0, 10).map((topic, index) => (
          <button
            onClick={() => window.location.href = `/statistics?db=${topic.key}`}
            key={index}
            className={styles.topicButton}
          >
            {topic.title}
          </button>
        ))}
      </div>
    </div>
  );
}
