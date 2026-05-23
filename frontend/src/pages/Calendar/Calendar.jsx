import "./Calendar.css";
import {useState} from "react";
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'
import CalendarChoreMo from "../../components/CalendarChoreMo";
import CalendarAvailMo from "../../components/CalendarAvailMo";


export default function Calendar() {

    return (
        <div className="calendar-page">
            <header>
                <h1 className="calendar-title">Availability</h1>
            </header>
              <CalendarAvailMo />
        </div>
    );
}