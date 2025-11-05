import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";

const EventsPage = () => {
  const { events, loading } = useSelector((state) => state.event);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          <EventCard active={true} data={events && events[0]} />
        </div>
      )}
    </>
  );
};

export default EventsPage;
