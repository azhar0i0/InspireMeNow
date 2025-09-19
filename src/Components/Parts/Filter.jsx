import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Filter = ({ onApplyFilters, onClearFilters }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mood, setMood] = useState("All moods");

  const handleApply = () => {
    onApplyFilters({ startDate, endDate, mood });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setMood("All moods");
    onClearFilters();
  };

  return (
    <div className="filters-card">
      <div className="filters-header d-flex justify-content-between align-items-center mb-2 flex-wrap">
        <h6 className="f-bold mb-0">Filter</h6>
        <a
          href="#"
          className="clear-link mt-2 mt-md-0"
          onClick={(e) => {
            e.preventDefault();
            handleClear();
          }}
        >
          × Clear All Filters
        </a>
      </div>

      <div className="filters-grid">
        {/* Date Range */}
        <div className="filter-item">
          <label>Date Range</label>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="date-input"
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="date-input"
              placeholderText="End Date"
            />
          </div>
        </div>

        {/* Mood Type */}
        <div className="filter-item mood-type">
          <label>Mood Type</label>
          <select
            className="form-select custom-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            {[
              "All moods",
              "Lonely",
              "Heartbroken",
              "Lost",
              "Anxious",
              "Overwhelmed",
              "Unmotivated",
              "Guilty",
              "Insecure",
              "Empty",
              "Stressed",
              "Angry",
              "Betrayed",
            ].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <div className="filter-actions text-center text-md-end">
          <button className="apply-btn w-100 w-md-auto" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
