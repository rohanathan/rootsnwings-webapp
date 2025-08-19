"use client";

import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Using inline SVG for FontAwesome icons as Next.js does not support direct link to CSS in components
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 576 512"
    fill="currentColor"
  >
    <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416c-22.1 0-40-17.9-40-40v-84c0-5.5-2.2-10.7-6.1-14.6c-3.9-3.9-9.1-6.1-14.6-6.1c-5.5 0-10.7 2.2-14.6 6.1c-3.9 3.9-6.1 9.1-6.1 14.6v84c0 22.1-17.9 40-40 40H160c-22.1 0-40-17.9-40-40v-84c0-5.5-2.2-10.7-6.1-14.6c-3.9-3.9-9.1-6.1-14.6-6.1c-5.5 0-10.7 2.2-14.6 6.1c-3.9 3.9-6.1 9.1-6.1 14.6v84c0 22.1-17.9 40-40 40H80c-22.1 0-40-17.9-40-40V335.8c-.3-2.7-.5-5.4-.5-8.1l.7-160.2H.2C-14.8 287.4-29.8 283.4-32 255.5c-.1-17.9 15-32.1 32-32.1h65.8L272.9 8.2c7.1-10.8 19.3-17.6 32-17.6s24.9 6.8 32 17.6L543.8 223.4H576c17 0 32 14.2 32 32.1z" />
  </svg>
);
const ChalkboardTeacherIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 640 512"
    fill="currentColor"
  >
    <path d="M192 128a128 128 0 1 1 256 0 128 128 0 1 1 -256 0zm-45.7 325.7a160 160 0 1 1 321.4 0A160 160 0 1 1 146.3 453.7zm152-325.7c-5.3 0-10.5 .3-15.7 .8c-28.7-29.5-68.5-48-112.3-48C84.5 80 0 164.5 0 268.8v22.4c0 21.6 13.9 40.7 34.3 47.3l49.7 16.6c17.5 5.8 28.5 22.5 25.5 40.3s-15.6 31.8-33.4 34.9l-58.4 10.4c-9.1 1.6-14.9 10.5-13.3 19.6s10.5 14.9 19.6 13.3l58.4-10.4c48.4-8.6 82.5-40.1 94.6-78.5c-4.9-.7-9.8-1.5-14.6-2.6c-13.6-2.9-26.6-8.6-38.3-16.7c-21.7-14.9-35.3-39.7-35.3-66.5V288H320c17.7 0 32-14.3 32-32V128h-32zm424.3 125.7a160 160 0 1 1 0-320c43.8 0 83.6 18.5 112.3 48c-5.2-.5-10.4-.8-15.7-.8c-17.7 0-32 14.3-32 32v128h-32c-17.7 0-32 14.3-32 32v22.4c0 26.8-13.6 51.6-35.3 66.5c-11.7 8.1-24.7 13.8-38.3 16.7c-4.9 1.1-9.8 1.9-14.6 2.6c12.1 38.4 46.2 69.9 94.6 78.5l58.4 10.4c9.1 1.6 18-4.2 19.6-13.3s-4.2-18-13.3-19.6l-58.4-10.4c-17.8-3.1-29.6-19.8-25.5-40.3l49.7-16.6c20.4-6.6 34.3-25.7 34.3-47.3V268.8c0-104.3-84.5-188.8-188.8-188.8z" />
  </svg>
);
const PlusCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
  </svg>
);
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 640 512"
    fill="currentColor"
  >
    <path d="M192 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0zm0 192c-15.5 0-30.9-.9-45.9-2.7l-4.5-.7L109 462.6c-13.1 3.5-26.9-3.1-30.4-16.2s3.1-26.9 16.2-30.4l19.8-5.3c1.9-.5 3.8-1.1 5.7-1.7l3-.9c16.3-4.9 33.1-7.5 50.4-7.5c34.1 0 65.5 11.2 90.1 30c14.2 11 25.5 25 33.4 41c1.3 2.7 3.3 5.3 5.6 7.6c.1 .1 .1 .2 .2 .3c.2 .2 .4 .4 .6 .6c2.4 2.4 5.3 4.4 8.6 5.8c.2 .1 .3 .1 .5 .2c.2 .1 .3 .2 .5 .2c.6 .3 1.3 .5 2 .7c.2 .1 .5 .2 .7 .3c.4 .1 .8 .2 1.2 .3c1.6 .3 3.3 .5 5 .5H448c3.2 0 6.2-.8 9.1-2.4c-12.8-17.7-23.7-37.4-32.2-58.8c-2.3-6.1-5.1-12-8.3-17.5c-3.1-5.4-6.3-10.6-9.6-15.6c-21.7-32.5-54.7-53.7-91.8-53.7c-21.6 0-42.4 6.1-60.1 17.5C216.7 337.5 204.3 351 192 351z" />
  </svg>
);
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M128 0c13.3 0 24 10.7 24 24V64H296V24c0-13.3 10.7-24 24-24s24 10.7 24 24V64h48c26.5 0 48 21.5 48 48v29c0 10.2-6.2 19.5-16 23.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V136.3c-9.8-3.9-16-13.1-16-23.3V112C0 85.5 21.5 64 48 64h48V24c0-13.3 10.7-24 24-24zM392 136H56c-8.8 0-16 7.2-16 16v248c0 8.8 7.2 16 16 16H392c8.8 0 16-7.2 16-16V152c0-8.8-7.2-16-16-16z" />
  </svg>
);
const UserGraduateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 640 512"
    fill="currentColor"
  >
    <path d="M48 0C21.5 0 0 21.5 0 48v248c0 12.8 5 25.1 13.9 34.1L279.7 510c4.1 4.1 9.2 6.5 14.3 7.4c1.1 .2 2.2 .3 3.3 .3c3.8 0 7.7-1.1 11.2-3.2L626.1 330c8.9-8.9 13.9-21.2 13.9-34.1V48c0-26.5-21.5-48-48-48H48zM494.6 244.6L294 445.2 45.4 244.6c-2.4-2.4-3.4-5.8-2.6-9.1s3.7-6.2 7-8.2L288 126.9V272c0 8.8 7.2 16 16 16s16-7.2 16-16V126.9L490.6 227.3c3.3 2 5.5 5.2 6.3 8.5s-1.4 6.7-3.8 9.1zM288 32c0 53 43 96 96 96c21.2 0 40.5-6.9 56.4-18.7L288 32z" />
  </svg>
);
const PoundSignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 384 512"
    fill="currentColor"
  >
    <path d="M96 0C43 0 0 43 0 96v80c0 44.2 35.8 80 80 80h24v64H80c-17.7 0-32 14.3-32 32s14.3 32 32 32H192c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-17.7 0-32 14.3-32 32s14.3 32 32 32H304c17.7 0 32-14.3 32-32s-14.3-32-32-32H128c-17.7 0-32-14.3-32-32V320H256c44.2 0 80-35.8 80-80V96c0-53-43-96-96-96H96zm128 80H128c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32z" />
  </svg>
);
const CommentsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M128 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h128v128c0 17.7 14.3 32 32 32s32-14.3 32-32V64h128c17.7 0 32-14.3 32-32s-14.3-32-32-32H128zM448 192c0-17.7-14.3-32-32-32H128c-44.2 0-80 35.8-80 80v64c0 44.2 35.8 80 80 80h96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V400h96c44.2 0 80-35.8 80-80V256c0-44.2-35.8-80-80-80z" />
  </svg>
);
const EnvelopeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM464 128V400H48V128L256 295.5 464 128zm-41.5 0l-160 120c-1.6 1.2-3.6 1.9-5.7 1.9s-4.1-.7-5.7-1.9L41.5 128H422.5z" />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
  </svg>
);
const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 640 512"
    fill="currentColor"
  >
    <path d="M384 128v107.3c0 24.1-19.5 43.7-43.7 43.7H299.7L219.3 361.6c-4.4 7.6-12.2 12.4-20.7 12.4H160c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32h192c17.7 0 32 14.3 32 32zM21.5 256C8.5 256-2.5 264.4 .6 277.5c2.3 8.8 8.6 16 16.5 18.2l7.5 2.1c8.3 2.3 13.9 10.1 13.9 18.8v64c0 8.7-5.6 16.5-13.9 18.8l-7.5 2.1c-7.9 2.2-14.2 9.4-16.5 18.2c-3.1 13.1 7.9 21.5 21 21.5H128V128H21c-13.1 0-24.1 8.4-21 21.5c2.3 8.8 8.6 16 16.5 18.2l7.5 2.1c8.3 2.3 13.9 10.1 13.9 18.8v64c0 8.7-5.6 16.5-13.9 18.8l-7.5 2.1c-7.9 2.2-14.2 9.4-16.5 18.2c-3.1 13.1 7.9 21.5 21 21.5zM480 96h128c17.7 0 32 14.3 32 32v224c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32z" />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
  </svg>
);
const PaperclipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M364.8 17.5C369.3 6.9 380.3 0 392 0c19.7 0 35.7 16 35.7 35.7V312c0 24.3-19.7 44-44 44s-44-19.7-44-44V152.1c0-18.7-15.3-34-34-34s-34 15.3-34 34V312c0 48.6 39.4 88 88 88s88-39.4 88-88V35.7C448 16 432 0 412.3 0c-11.7 0-22.7 6.9-27.2 17.5L256 192 128 48 0 192l128 144 128-144 135.2 165.5z" />
  </svg>
);
const PaperPlaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M498.1 5.9c-2.3-2.3-5.3-3.6-8.5-3.6-2.5 0-5.1 .8-7.3 2.4L32 172.9c-15.5 8.9-24 25.1-24 42.4V448c0 15.5 10.9 29.5 26.5 31.8c.2 0 .4 .1 .6 .1c10.3 0 20.3-4.5 27.2-12.7L256 295.5l194.7 161.7c8.8 7.3 21.6 7.3 30.5 0c8.8-7.3 12.3-18.6 12.3-30.5V16c0-6.8-2.6-13.4-7.3-18.1zM464 128V400H48V128L256 295.5 464 128z" />
  </svg>
);
const SmileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM192 208c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM384 208c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM128 288a128 128 0 1 1 256 0 128 128 0 1 1 -256 0z" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M224 256c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80zm-128 32c-70.7 0-128 57.3-128 128v48c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32v-48c0-70.7-57.3-128-128-128H96z" />
  </svg>
);

const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M485.4 340.5c-6.8-8.2-12.9-16.7-18.8-25.1c-16.2-22.9-29.2-47.5-39.7-72.9c-1.3-3.1-2.6-6.1-3.9-9.2c-5.7-13.9-10.7-27.9-14.9-42.3c-13.8-46.7-21-96.1-21-147.2V80c0-17.7 14.3-32 32-32H384c17.7 0 32 14.3 32 32v32c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V80c0-17.7 14.3-32 32-32H512c17.7 0 32 14.3 32 32v14.4c0 148.6-26.6 290.4-74.8 424.3c-1.3 3.6-2.6 7.1-4 10.6c-48.2 133.9-114 263.9-183 346.7c-17.5 21.1-43 36.6-70.1 43.6c-11.6 3-23.4 4.5-35.2 4.5c-39.4 0-77.9-19.1-102.3-54.7c-40.4-57.5-62.8-121.7-62.8-185.3V256c0-17.7-14.3-32-32-32h-32c-17.7 0-32 14.3-32 32V296c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V256z" />
  </svg>
);

const QuestionCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-20.5 27.6-35.3 49.3-35.3h53.1c16.3 0 31.9 6.8 42.7 18.2l-36.9 33.1c-11.6-9.1-27.1-14.1-43.1-14.1s-31.5 5-43.1 14.1l-36.9-33.1zM192 288c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM384 288c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM128 288a128 128 0 1 1 256 0 128 128 0 1 1 -256 0z" />
  </svg>
);

const SignOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M352 96c0-17.7-14.3-32-32-32s-32 14.3-32 32V160H160c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h128v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352h112c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H352V96zm-96-32V96H160c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V96h112c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H256z" />
  </svg>
);

const BarsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
  </svg>
);

const Messages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [studentList, setStudentList] = useState([]);
  const [conversationItems, setConversationItems] = useState([]);
  const [studentMentorMsg, setStudentMentorMsg] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [typedMessage, setTypedMessage] = useState(null);
  const profileDropdownBtnRef = useRef(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMentorClasses = async (currentUser) => {
      if (!currentUser) return;
      
      const idToken = await currentUser.getIdToken();
      const response = await axios.get(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes?mentorId=${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const studentPromises = response.data.classes.map(async (classItem) => {
        const bookingsResponse = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings?classId=${classItem.classId}`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const userPromises = bookingsResponse.data.bookings.map(
          async (booking) => {
            const userResponse = await axios.get(
              `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${booking.studentId}`,
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return userResponse.data;
          }
        );
        return Promise.all(userPromises);
      });

      const students = (await Promise.all(studentPromises)).flat();
      setStudentList(students);
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchMentorClasses(currentUser);
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/getstarted';
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchStudentMentorMsg = async () => {
    if (!user || !selectedStudent) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/messages/conversation?studentId=${selectedStudent?.fullUser?.uid}&mentorId=${user?.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setStudentMentorMsg(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchStudentMentorMsg();
  }, [selectedStudent]);

  useEffect(() => {
    const generateConversationItems = () => {
      const statuses = [
        "Active Student",
        "Schedule Change",
        "Advanced",
        "Intermediate",
        "Beginner",
      ];
      const messages = [
        "Thank you for the session today! I have a question about...",
        "Hi ma'am, I need to reschedule tomorrow's session...",
        "Perfect! Looking forward to our session tomorrow. Thank you!",
        "Got it! I'll practice the footwork and see you on Wednesday.",
        "I'm looking forward to our next class!",
        "Could you send me the notes from the last session?",
      ];
      const times = [
        "2m ago",
        "1h ago",
        "3h ago",
        "1d ago",
        "2d ago",
        "3d ago",
      ];
      const bgColors = [
        "bg-primary",
        "bg-red-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-blue-500",
        "bg-teal-500",
      ];
      const statusBgs = [
        "bg-green-100",
        "bg-orange-100",
        "bg-red-100",
        "bg-blue-100",
        "bg-teal-100",
      ];
      const statusTexts = [
        "text-green-800",
        "text-orange-800",
        "text-red-800",
        "text-blue-800",
        "text-teal-800",
      ];

      return studentList?.map((user, index) => {
        const student = user.user;
        const initials = `${student.firstName
          .charAt(0)
          .toUpperCase()}${student.lastName.charAt(0).toUpperCase()}`;
        const name = `${student.firstName} ${student.lastName}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const message =
          studentMentorMsg.length > 0
            ? studentMentorMsg[0].message
            : "Start a conversation";

        const time = times[Math.floor(Math.random() * times.length)];
        const bgColor = bgColors[index % bgColors.length];
        const statusBg = statusBgs[index % statusBgs.length];
        const statusText = statusTexts[index % statusTexts.length];
        const isUnread = index % 3 === 0;

        return {
          initials: initials,
          name: name,
          time: time,
          message: message,
          status: status,
          bgColor: bgColor,
          statusBg: statusBg,
          statusText: statusText,
          dotColor: bgColor,
          borderColor: isUnread ? "border-primary" : "border-transparent",
          unreadBg: isUnread ? "bg-blue-50" : "",
          checked: !isUnread,
          fullUser: student,
        };
      });
    };
    if (studentList.length > 0) {
      setConversationItems(generateConversationItems());
    }
  }, [studentList]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleOutsideClick = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setIsProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", icon: <HomeIcon />, href: "/mentor/dashboard" },
    {
      name: "My Classes",
      icon: <ChalkboardTeacherIcon />,
      href: "/mentor/myclass",
    },
    {
      name: "Host a Class",
      icon: <PlusCircleIcon />,
      href: "/mentor/hostaclass",
    },
    { name: "Workshops", icon: <UsersIcon />, href: "/mentor/workshops" },
    { name: "Schedule", icon: <CalendarIcon />, href: "/mentor/schedule" },
    { name: "Students", icon: <UserGraduateIcon />, href: "/mentor/students" },
    { name: "Earnings", icon: <PoundSignIcon />, href: "/mentor/earnings" },
  ];

  const currentNav = { name: "Messages", icon: <CommentsIcon />, href: "#" };

  const messageStats = [
    {
      title: "Total",
      value: conversationItems.length.toString(),
      description: "All Conversations",
      icon: <EnvelopeIcon className="text-blue-600" />,
      bgColor: "bg-blue-100",
      titleColor: "text-blue-500",
    },
    {
      title: "Unread",
      value: conversationItems
        .filter((item) => !item.checked)
        .length.toString(),
      description: "Need Response",
      icon: <EnvelopeIcon className="text-red-600" />,
      bgColor: "bg-red-100",
      titleColor: "text-red-500",
    },
    {
      title: "Groups",
      value: "12",
      description: "Group Chats",
      icon: <UsersIcon className="text-green-600" />,
      bgColor: "bg-green-100",
      titleColor: "text-green-500",
    },
    {
      title: "Response",
      value: "12min",
      description: "Avg Response Time",
      icon: <CalendarIcon className="text-purple-600" />,
      bgColor: "bg-purple-100",
      titleColor: "text-purple-500",
    },
  ];

  const submitMessage = async () => {
    if (!user || !selectedStudent || !typedMessage?.trim()) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/messages`,
        {
          senderId: user.uid,
          studentId: selectedStudent?.fullUser?.uid,
          mentorId: user.uid,
          parentId: selectedStudent?.fullUser?.parentId,
          message: typedMessage,
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data?.message) {
        setTypedMessage("");
        fetchStudentMentorMsg();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-background font-sans">
      <style jsx global>{`
        body {
          background-color: #f9fbff;
        }
        .tailwind-config {
          --color-primary: #00a2e8;
          --color-primary-dark: #00468c;
          --color-primary-light: #e6f7ff;
          --color-background: #f9fbff;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              id="mobile-menu-btn"
              className="md:hidden text-gray-600 hover:text-primary"
              onClick={toggleSidebar}
            >
              <BarsIcon className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">
              Roots & Wings
            </h1>
            <span className="hidden md:block text-sm text-gray-500">
              Mentor Portal
            </span>
          </div>

          {/* Right: Profile Dropdown */}

          <MentorHeaderAccount
            isProfileDropdownOpen={isProfileDropdownOpen}
            profileDropdownBtnRef={profileDropdownBtnRef}
            handleProfileDropdownClick={toggleProfileDropdown}
            profileDropdownRef={profileDropdownRef}
            user={user}
            mentorDetails={null}
          />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav
          className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
          id="sidebar"
        >
          <div className="p-6">
            {/* Navigation Items */}
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1"
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
              <a
                href={currentNav.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white"
              >
                {currentNav.icon}
                <span>{currentNav.name}</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {conversationItems.filter((item) => !item.checked).length}
                </span>
              </a>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                  <EnvelopeIcon className="inline-block mr-2" />
                  Send Message
                </button>
                <button className="w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium">
                  <VideoIcon className="inline-block mr-2" />
                  Start Session Now
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Messages
              </h1>
              <p className="text-gray-600">
                Communicate with your students and manage conversations
              </p>
            </div>
            <div className="flex space-x-3 flex-wrap sm:flex-nowrap gap-2">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
                />
                {/* <SearchIcon className="absolute left-3 top-3 text-gray-400" /> */}
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto">
                <i class="fas fa-plus mr-2"></i>New Message
              </button>
            </div>
          </div>

          {/* Message Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {messageStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                  <span className={`${stat.titleColor} text-sm font-medium`}>
                    {stat.title}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Main Messages Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Conversations
                  </h3>
                  <div className="flex space-x-2">
                    <button className="text-xs px-3 py-1 bg-primary text-white rounded-full">
                      All
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                      Unread
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {conversationItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedStudent(item);
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${item.borderColor} ${item.unreadBg}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center`}
                      >
                        {item.icon ? (
                          <span className="text-white text-sm">
                            {item.icon}
                          </span>
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {item.initials}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs ${item.statusBg} ${item.statusText} px-2 py-1 rounded-full`}
                          >
                            {item.status}
                          </span>
                          {item.checked ? (
                            <i className="fas fa-check text-gray-400 text-xs"></i>
                          ) : (
                            <div
                              className={`w-2 h-2 ${item.dotColor} rounded-full`}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
              {/* Message Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedStudent?.fullUser?.firstName}{" "}
                      {selectedStudent?.fullUser?.lastName}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Kathak Basics</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        {Math.random() > 0.99 ? "Online now" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <VideoIcon />
                  </button> */}
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <i className="fas fa-phone"></i>
                  </button>
                  {/* <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <i className="fas fa-ellipsis-h"></i>
                  </button> */}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-80">
                <>
                  {studentMentorMsg.map((msg, index) => {
                    return (
                      <>
                        {msg.mentorId !== msg.senderId ? (
                          <>
                            {/* Mentor Response */}
                            <div className="flex items-start space-x-3 justify-end">
                              <div className="flex-1 flex justify-end">
                                <div className="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-md">
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  PS
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Student Message */}
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  AM
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg rounded-tl-none p-3 max-w-md">
                                  <p className="text-sm text-gray-900">
                                    {msg.message}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  2:34 PM
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    );
                  })}
                </>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  {/* <button className="p-2 text-gray-400 hover:text-gray-600">
                    <PaperclipIcon />
                  </button> */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-12"
                      defaultValue={typedMessage}
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                    />
                    {/* <button className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                      <SmileIcon />
                    </button> */}
                  </div>
                  <button
                    onClick={submitMessage}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <PlusCircleIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Message Templates */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Templates
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">
                    Session Reminder
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reminder: Your session is scheduled for tomorrow at [time]
                  </p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">
                    Practice Feedback
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Great progress in today's session! Keep practicing...
                  </p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">
                    Homework Assignment
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    For next session, please practice the following...
                  </p>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900 text-sm">
                    Encouragement
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    You're doing excellent work! Keep up the dedication...
                  </p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="text-blue-600 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      New message from Ananya Mehta
                    </p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="text-orange-600 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Raj Kumar requested session reschedule
                    </p>
                    <p className="text-xs text-gray-600">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="text-green-600 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Weekend Kathak Batch group activity
                    </p>
                    <p className="text-xs text-gray-600">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-file text-purple-600 text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Shared practice video with Maya Rajan
                    </p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-red-600 text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Shreya Patel left a 5-star review
                    </p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        id="sidebar-overlay"
        className={`${
          isSidebarOpen ? "" : "hidden"
        } fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden`}
        onClick={toggleSidebar}
      ></div>
    </div>
  );
};

export default Messages;
