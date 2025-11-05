import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Import toast
import {
  deleteEvent,
  getAllEventsShop,
  clearError,
  clearSuccess,
} from "../../redux/events/eventSlice";

import Loader from "../Layout/Loader";

const AllEvents = () => {
  const { events, loading, success, error, message } = useSelector(
    (state) => state.event
  );
  const { seller } = useSelector((state) => state.seller);
  console.log(seller);
  console.log(events);
  const dispatch = useDispatch();

  // ✅ Initial fetch
  useEffect(() => {
    if (seller?.userId?._id) {
      dispatch(getAllEventsShop(seller.userId._id));
    }
  }, [dispatch, seller?.userId?._id]);

  // ✅ Handle success
  useEffect(() => {
    if (success) {
      toast.success(message || "Operation successful");
      dispatch(clearSuccess());
      // Reload events after delete
      if (seller?.userId?._id) {
        dispatch(getAllEventsShop(seller.userId._id));
      }
    }
  }, [success, message, dispatch, seller?.userId?._id]);

  // ✅ Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(id));
    }
  };

  const columns = [
    { field: "id", headerName: "Event Id", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: "sold",
      headerName: "Sold out",
      type: "number",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "Preview",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        const d = params.row.name;
        const event_name = d.replace(/\s+/g, "-");
        return (
          <>
            <Link to={`/event/${event_name}`}>
              <Button>
                <AiOutlineEye size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "Delete",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Button onClick={() => handleDelete(params.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </>
        );
      },
    },
  ];

  const row = [];

  events &&
    events.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: "INR₹ " + item.discountPrice,
        Stock: item.stock,
        sold: item?.soldOut || 0,
      });
    });

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AllEvents;
