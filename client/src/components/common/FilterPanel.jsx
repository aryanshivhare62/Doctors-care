import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({
  departments = [],
  selectedDepartment,
  onSelectDepartment,
  sortBy,
  onSelectSort,
  onReset,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      {/* Department Filter */}
      <div style={{ minWidth: '180px', flex: '1' }}>
        <select
          value={selectedDepartment}
          onChange={(e) => onSelectDepartment(e.target.value)}
          className="form-select"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div style={{ minWidth: '180px', flex: '1' }}>
        <select
          value={sortBy}
          onChange={(e) => onSelectSort(e.target.value)}
          className="form-select"
        >
          <option value="">Sort: Featured First</option>
          <option value="rating_desc">Highest Rated</option>
          <option value="experience_desc">Most Experienced</option>
          <option value="fee_asc">Fee: Low to High</option>
          <option value="fee_desc">Fee: High to Low</option>
        </select>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        className="btn btn-outline"
        title="Reset Filters"
        style={{ padding: '0.65rem 0.9rem' }}
      >
        <RotateCcw size={16} />
        <span>Reset</span>
      </button>
    </div>
  );
};

export default FilterPanel;
