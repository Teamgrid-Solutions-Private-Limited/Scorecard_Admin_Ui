import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
const rows = [
  {
    id: 1,
    date: "2024-01-15",
    bill: "World",
    action: "World",
  },
  {
    id: 2,
    date: "2024-01-16",
    bill: "World",
    action: "World",
  },
  {
    id: 3,
    date: "2024-01-17",
    bill: "World",
    action: "World",
  },
  {
    id: 4,
    date: "2024-01-18",
    bill: "World",
    action: "World",
  },
  { id: 5, date: "2024-01-19", bill: "Infrastructure Plan", action: "Pending" },
  { id: 6, date: "2024-01-20", bill: "Defense Budget", action: "Passed" },
  {
    id: 7,
    date: "2024-01-21",
    bill: "Social Security Expansion",
    action: "Pending",
  },
  { id: 8, date: "2024-01-22", bill: "Immigration Reform", action: "Rejected" },
  {
    id: 9,
    date: "2024-01-23",
    bill: "Technology Advancement",
    action: "Passed",
  },
  {
    id: 10,
    date: "2024-01-24",
    bill: "Affordable Housing Act",
    action: "Pending",
  },
  {
    id: 11,
    date: "2024-01-25",
    bill: "Renewable Energy Initiative",
    action: "Passed",
  },
  {
    id: 12,
    date: "2024-01-26",
    bill: "Minimum Wage Increase",
    action: "Rejected",
  },
  { id: 13, date: "2024-01-27", bill: "Police Reform Act", action: "Pending" },
  { id: 14, date: "2024-01-28", bill: "Net Neutrality Bill", action: "Passed" },
  {
    id: 15,
    date: "2024-01-29",
    bill: "Cybersecurity Enhancement",
    action: "Passed",
  },
  {
    id: 16,
    date: "2024-01-30",
    bill: "Workplace Safety Act",
    action: "Rejected",
  },
  { id: 17, date: "2024-01-31", bill: "Medicare Expansion", action: "Pending" },
  {
    id: 18,
    date: "2024-02-01",
    bill: "Foreign Aid Reduction",
    action: "Rejected",
  },
  {
    id: 19,
    date: "2024-02-02",
    bill: "Voting Rights Expansion",
    action: "Passed",
  },
  {
    id: 20,
    date: "2024-02-03",
    bill: "Student Loan Forgiveness",
    action: "Pending",
  },
  {
    id: 21,
    date: "2024-02-04",
    bill: "Gun Control Measures",
    action: "Rejected",
  },
  {
    id: 22,
    date: "2024-02-05",
    bill: "Public Transportation Funding",
    action: "Passed",
  },
  {
    id: 23,
    date: "2024-02-06",
    bill: "Affordable Childcare Act",
    action: "Pending",
  },
  {
    id: 24,
    date: "2024-02-07",
    bill: "Consumer Data Protection",
    action: "Passed",
  },
  {
    id: 25,
    date: "2024-02-08",
    bill: "Veterans Benefits Enhancement",
    action: "Passed",
  },
  {
    id: 26,
    date: "2024-02-09",
    bill: "Online Privacy Regulations",
    action: "Pending",
  },
  {
    id: 27,
    date: "2024-02-10",
    bill: "Environmental Protection Act",
    action: "Rejected",
  },
  {
    id: 28,
    date: "2024-02-11",
    bill: "Small Business Relief",
    action: "Passed",
  },
  {
    id: 29,
    date: "2024-02-12",
    bill: "Internet Freedom Act",
    action: "Pending",
  },
  {
    id: 30,
    date: "2024-02-13",
    bill: "Border Security Enhancement",
    action: "Rejected",
  },
];

export default function CustomizedDataGrid() {
  const navigate = useNavigate();

  const columns = [
    {
      field: "date",
      flex: 1, 
      headerName: "Date",
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{new Date(params.value).toLocaleDateString()}</Typography>
      ),
    },
    { field: "bill", flex: 1, headerName: "Bill Name", minWidth: 150 }, 

    {
      field: "action",
      flex: 1, 
      headerName: "Action",
      minWidth: 200,
	  sortable: false,	
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <EditIcon
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", marginLeft: "10px" }}
          />
          <DeleteForeverIcon style={{ cursor: "pointer" }} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DataGrid
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        disableRowSelectionOnClick
      />
    </div>
  );
}

