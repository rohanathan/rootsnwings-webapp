"use client";

import { useState, useEffect } from 'react';

// Inline SVG for Font Awesome icons to make the component self-contained
const TimesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 320 512" fill="currentColor">
        <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
    </svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 384 512" fill="currentColor">
        <path d="M64 48c0-8.8 7.2-16 16-16H224V128c0 17.7 14.3 32 32 32H368V400c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V96C0 72.5 17.5 48 48 48H64zM256 0c-17.7 0-32 14.3-32 32V128H64C28.7 128 0 156.7 0 192V416c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160L256 0zM368 192c-8.8 0-16 7.2-16 16v160c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
    </svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512" fill="currentColor">
        <path d="M192 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0zm0 192c-15.5 0-30.9-.9-45.9-2.7l-4.5-.7L109 462.6c-13.1 3.5-26.9-3.1-30.4-16.2s3.1-26.9 16.2-30.4l19.8-5.3c1.9-.5 3.8-1.1 5.7-1.7l3-.9c16.3-4.9 33.1-7.5 50.4-7.5c34.1 0 65.5 11.2 90.1 30c14.2 11 25.5 25 33.4 41c1.3 2.7 3.3 5.3 5.6 7.6c.1 .1 .1 .2 .2 .3c.2 .2 .4 .4 .6 .6c2.4 2.4 5.3 4.4 8.6 5.8c.2 .1 .3 .1 .5 .2c.2 .1 .3 .2 .5 .2c.6 .3 1.3 .5 2 .7c.2 .1 .5 .2 .7 .3c.4 .1 .8 .2 1.2 .3c1.6 .3 3.3 .5 5 .5H448c3.2 0 6.2-.8 9.1-2.4c-12.8-17.7-23.7-37.4-32.2-58.8c-2.3-6.1-5.1-12-8.3-17.5c-3.1-5.4-6.3-10.6-9.6-15.6c-21.7-32.5-54.7-53.7-91.8-53.7c-21.6 0-42.4 6.1-60.1 17.5C216.7 337.5 204.3 351 192 351z"/>
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512" fill="currentColor">
        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 35.7C57.4 323.5 0 380.9 0 457.7V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48v-6.3c0-76.8-57.4-134.2-128.3-162.9C338.4 300.9 281.8 320 224 320s-114.4-19.1-152.3-48.3z"/>
    </svg>
);
const ChildIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
        <path d="M304 96a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM120 248.8c12.2-2.9 25.1-4.8 38.4-5.3L159.9 243l.4-19.4c1.1-54.8 28.5-104.9 71.9-138.8c24.6-19.2 55.4-29.8 87.7-29.8h.1c8.4 0 16.7 1.1 24.8 3.2l1.9 .5c5.3 1.4 10.3 3.2 15.2 5.4c17.5 7.9 33 18.6 46.2 31.9L448 96l-32 32-12.7-12.7c-9.7-9.7-22.6-15.1-36.2-15.1c-8.9 0-17.7 1.8-25.9 5.3c-20.9 8.9-38.3 22.8-51.1 40.7c-12.8 17.9-20 38.6-20 60.7V224H288v48c0 17.7-14.3 32-32 32s-32-14.3-32-32V256H160c-17.7 0-32-14.3-32-32s14.3-32 32-32h-8c-26.5 0-48 21.5-48 48v48h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H32c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32h88z"/>
    </svg>
);
const ShieldAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor">
        <path d="M256 0c51.2 0 102.4 14.8 144.1 44.5c41.8 29.7 73.1 71.9 88.5 120.3c15.4 48.4 14.6 100.9-2.2 148.9c-16.7 48-46.6 90.1-85.3 123.6c-38.7 33.5-84.1 58.1-133.5 70.8c-49.4 12.7-100.7 12.7-150.1 0C84.2 466.7 38.8 442 0.1 408.5C-11 398.8-11.8 381.1 0.7 371.4c12.5-9.7 28.1-9.3 39.8 .9C68.9 397.6 112.5 421.3 160 432c47.5 10.7 96.6 10.7 144.1 0c47.5-10.7 91.1-34.4 127.3-64.8c36.2-30.5 65.4-67.9 84.1-109.1c18.7-41.2 24.1-86.8 17.4-131.7c-6.7-44.9-26.3-86.3-56.1-118.8C391.8 15.6 323.2 0 256 0z"/>
    </svg>
);
const UserShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512" fill="currentColor">
        <path d="M192 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0zm-45.7 35.7C57.4 323.5 0 380.9 0 457.7V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48v-6.3c0-76.8-57.4-134.2-128.3-162.9C338.4 300.9 281.8 320 224 320s-114.4-19.1-152.3-48.3zM626.5 301.7c-5.8-2.6-12.2-4.2-18.7-4.2c-1.3 0-2.6 .1-3.9 .2c-.2 .1-.4 .1-.6 .2c-16.1 2.8-31.1 9.4-44.2 19.7c-1.7 1.3-3.3 2.6-4.8 4c-5 4.8-10.3 9.4-15.6 13.9c-4 3.4-7.8 6.5-11.4 9.4c-9.1 7.6-18.7 14.1-28.7 19.5c-4.2 2.3-8.4 4.5-12.7 6.6c-4.2 2.1-8.5 4.1-12.8 5.9c-5.2 2.2-10.5 4.2-16 5.9c-6.4 2-12.8 3.8-19.4 5.3c-2.3 .5-4.7 1-7.1 1.4c-2.4 .4-4.8 .7-7.2 .9c-1.6 .2-3.3 .3-4.9 .3c-4.9 0-9.8-.4-14.7-1.1c-15.9-2.4-31.5-6.6-46.7-12.7c-21.4-8.8-41-21.6-58-38.6c-31-31-48.8-73.4-48.8-118.1V128H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H384c-17.7 0-32-14.3-32-32V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H96c-17.7 0-32 14.3-32 32s14.3 32 32 32H224v128c0 30.6 15.6 59.5 42 77.8c11.6 8 24.5 13.6 38.5 16.6c2.7 .6 5.4 1.1 8.2 1.5c4.7 .7 9.4 1.1 14.2 1.1c5.9 0 11.9-.6 17.8-1.9c13.8-3 27.2-8.5 39.8-16.1c11-6.6 21.2-14.7 30.2-24.1c1.3-1.4 2.6-2.8 3.8-4.3c.7-.8 1.4-1.6 2.1-2.4c1.1-1.2 2.2-2.3 3.3-3.5c1.4-1.5 2.8-3 4.2-4.5c.3-.4 .5-.7 .8-1.1c2-2.5 3.9-4.9 5.8-7.5c2.4-3.3 4.7-6.8 6.9-10.4c1.9-3.2 3.6-6.6 5.2-10c.8-1.7 1.6-3.4 2.4-5.1c.5-1.1 1-2.2 1.5-3.3c.4-1 .9-2 1.3-3.1c.4-1 .8-2 1.2-3c.4-.9 .8-1.9 1.1-2.9c.4-1 .8-2 1.1-3c.3-.8 .6-1.7 .9-2.6c.3-.8 .5-1.7 .8-2.5c.2-.8 .4-1.7 .6-2.5c.1-.8 .3-1.7 .4-2.5c.1-.8 .2-1.7 .3-2.5c.1-.8 .1-1.7 .2-2.5c.1-.8 .1-1.7 .1-2.5V256c0-17.7-14.3-32-32-32H384v-32c0-17.7-14.3-32-32-32s-32 14.3-32 32v32H192v32c0-17.7 14.3-32 32-32z"/>
    </svg>
);
const GraduationCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512" fill="currentColor">
        <path d="M48 0C21.5 0 0 21.5 0 48v248c0 12.8 5 25.1 13.9 34.1L279.7 510c4.1 4.1 9.2 6.5 14.3 7.4c1.1 .2 2.2 .3 3.3 .3c3.8 0 7.7-1.1 11.2-3.2L626.1 330c8.9-8.9 13.9-21.2 13.9-34.1V48c0-26.5-21.5-48-48-48H48zM494.6 244.6L294 445.2 45.4 244.6c-2.4-2.4-3.4-5.8-2.6-9.1s3.7-6.2 7-8.2L288 126.9V272c0 8.8 7.2 16 16 16s16-7.2 16-16V126.9L490.6 227.3c3.3 2 5.5 5.2 6.3 8.5s-1.4 6.7-3.8 9.1zM288 32c0 53 43 96 96 96c21.2 0 40.5-6.9 56.4-18.7L288 32z"/>
    </svg>
);
const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
        <path d="M256 0C149.7 0 64 85.7 64 192V368c0 44.2 35.8 80 80 80h16c-17.7-11.2-28.7-30-28.7-50.7c0-35.3 28.7-64 64-64s64 28.7 64 64c0 20.7-11 39.5-28.7 50.7H384c44.2 0 80-35.8 80-80V192c0-106.3-85.7-192-192-192zM128 192a128 128 0 1 1 256 0V320H128V192zm64 176a64 64 0 1 0 128 0 64 64 0 1 0 -128 0z"/>
    </svg>
);
const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
        <path d="M512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 114.6 114.6 0 256 0S512 114.6 512 256zM256 480c10.3 0 20.4-.6 30.2-1.7l-82.5-82.5c-20.1-20.1-20.1-52.5 0-72.6l64-64c20.1-20.1 52.5-20.1 72.6 0l82.5 82.5c1.1-9.8 1.7-19.9 1.7-30.2c0-10.7-1.4-21-3.9-30.8L322.9 221c-29.4-29.4-29.4-77.1 0-106.5l3.5-3.5c29.4-29.4 77.1-29.4 106.5 0l48 48c29.4 29.4 29.4 77.1 0 106.5l-2.8 2.8c-9.8 2.5-20.1 3.9-30.8 3.9c-10.3 0-20.4-.6-30.2-1.7l-82.5 82.5c-20.1 20.1-52.5 20.1-72.6 0l-64-64c-20.1-20.1-20.1-52.5 0-72.6l-82.5-82.5c-1.1 9.8-1.7 19.9-1.7 30.2c0 141.4 114.6 256 256 256zM134.4 340.9L160 366.6V306.9c0-11.8 9.5-21.3 21.3-21.3s21.3 9.5 21.3 21.3v59.7l25.7 25.7c25.4-2.8 49-14.8 68.3-33.8l-82.5-82.5c-41.2-41.2-108-41.2-149.2 0L90.7 271.7c-17.7 17.7-27.6 41.5-27.6 66.7c0 25.2 9.9 49 27.6 66.7L134.4 340.9z"/>
    </svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
        <path d="M352 256c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48s21.5-48 48-48h96c26.5 0 48 21.5 48 48zm-48-48c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32zm-96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM256 480A224 224 0 1 1 256 32a224 224 0 1 1 0 448zM392.1 364.5c1.4-1.4 1.4-3.6 0-5L350.3 322.7c-1.4-1.4-3.6-1.4-5 0s-1.4 3.6 0 5L387.1 364c1.4 1.4 3.6 1.4 5 0zM350.3 189.3c1.4-1.4 1.4-3.6 0-5L308.5 147.5c-1.4-1.4-3.6-1.4-5 0s-1.4 3.6 0 5L345.3 184.2c1.4 1.4 3.6 1.4 5 0zM170.8 147.5L129 189.3c-1.4 1.4-1.4 3.6 0 5s3.6 1.4 5 0L175.8 152.5c1.4-1.4 1.4-3.6 0-5s-3.6-1.4-5 0zM129 322.7L170.8 364.5c-1.4 1.4-1.4 3.6 0 5s3.6 1.4 5 0L134 327.7c1.4-1.4 1.4-3.6 0-5s-3.6-1.4-5 0z"/>
    </svg>
);
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
        <path d="M472 0C494.6 0 512 17.4 512 40v336c0 22.6-17.4 40-40 40H376.5c-3.1 0-6.1-.8-8.7-2.3-2.6-1.5-4.8-3.7-6.2-6.4l-25.1-47.5c-6.8-13-20.7-21.2-35.6-21.2H128c-26.5 0-48-21.5-48-48V160c0-26.5 21.5-48 48-48h187.6c13.7 0 26.6-6.4 35.2-17.2l8.3-10.4c13.2-16.5 35.8-21.7 54.8-13.3l37.2 16.6c4 1.8 8.1 2.7 12.3 2.7zM40 160c-22.6 0-40 17.4-40 40v200c0 22.6 17.4 40 40 40H265.5c3.1 0 6.1 .8 8.7 2.3 2.6 1.5 4.8 3.7 6.2 6.4l25.1 47.5c6.8 13 20.7 21.2 35.6 21.2h66.9c22.6 0 40-17.4 40-40V120c0-22.6-17.4-40-40-40H224.4c-13.7 0-26.6 6.4-35.2 17.2l-8.3 10.4c-13.2 16.5-35.8 21.7-54.8 13.3L88.9 92.9C84.9 91.1 80.8 90.2 76.7 90.2z"/>
    </svg>
);
const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 640 512" fill="currentColor">
        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H256V192H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H256V320H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H256V448H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H224v32c0 17.7 14.3 32 32 32s32-14.3 32-32V448h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320V320h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320V192h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320V64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H288z"/>
    </svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512" fill="currentColor">
        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
    </svg>
);
const RunningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 640 512" fill="currentColor">
        <path d="M128 320c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32zM368 464c-17.7 0-32-14.3-32-32s14.3-32 32-32h80c17.7 0 32 14.3 32 32s-14.3 32-32 32H368zM576 384c0-17.7-14.3-32-32-32H368c-17.7 0-32 14.3-32 32s14.3 32 32 32H544c17.7 0 32-14.3 32-32zM528 224c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7 14.3 32 32 32s32-14.3 32-32V224zM432 160c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7 14.3 32 32 32s32-14.3 32-32V160zM48 240c-13.3 0-24 10.7-24 24s10.7 24 24 24h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H48zm448 80c0-13.3-10.7-24-24-24H336c-13.3 0-24 10.7-24 24s10.7 24 24 24h168c13.3 0 24-10.7 24-24zM320 128c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32zM128 416c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32z"/>
    </svg>
);
const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor">
        <path d="M384 32H128C57.3 32 0 89.3 0 160v128c0 70.7 57.3 128 128 128h256c70.7 0 128-57.3 128-128V160c0-70.7-57.3-128-128-128zM128 64h256c22.1 0 40 17.9 40 40s-17.9 40-40 40H128c-22.1 0-40-17.9-40-40s17.9-40 40-40zm-40 128h40c8.8 0 16 7.2 16 16s-7.2 16-16 16H88c-8.8 0-16-7.2-16-16s7.2-16 16-16zm256 0h40c8.8 0 16 7.2 16 16s-7.2 16-16 16h-40c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-128 0h40c8.8 0 16 7.2 16 16s-7.2 16-16 16h-40c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-40 128h40c8.8 0 16 7.2 16 16s-7.2 16-16 16h-40c-8.8 0-16-7.2-16-16s7.2-16 16-16zm256 0h40c8.8 0 16 7.2 16 16s-7.2 16-16 16h-40c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-128 0h40c8.8 0 16 7.2 16 16s-7.2 16-16 16h-40c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 448 512" fill="currentColor">
        <path d="M135.2 17.7L128 32H128c-9.7 0-19.1 2.3-27.7 6.8l-8.2 4.4c-4.4 2.3-9.5 3.5-14.5 3.5c-4.9 0-9.8-1.2-14.1-3.6L5.4 36.3C-1.8 32.5-1.8 22.9 5.4 19.1s18-3.4 25.1 3.5l14 14.8L96 112h256l51.5-74.6c11.9-17.2 30.1-17.2 42.1 0l22.6 32.8c12 17.4 12 45.7 0 63.1L384 272c-2.8 4.1-6.1 7.8-9.9 11.2l-3.3 2.9c-2.3 2-4.8 3.8-7.5 5.5l-21.4 13.5c-20.2 12.8-43.9 19.9-68.5 19.9H192c-24.6 0-48.3-7.1-68.5-19.9l-21.4-13.5c-2.7-1.7-5.2-3.5-7.5-5.5l-3.3-2.9c-3.8-3.4-7.1-7.1-9.9-11.2L96 112H352c17.7 0 32-14.3 32-32s-14.3-32-32-32H135.2zM128 112L128 416c0 17.7 14.3 32 32 32H288c17.7 0 32-14.3 32-32V112H128z"/>
    </svg>
);

const stepContent = [
    {
        title: 'Welcome',
        icon: <UsersIcon />,
        iconBg: 'bg-primary',
        iconColor: 'text-white',
        content: (
            <>
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <UsersIcon className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Who will be learning with Roots & Wings?</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Help us create the perfect learning experience for you and your family
                </p>
                
                {/* Learning Options */}
                <div className="space-y-4">
                    <div className="learning-option p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-all cursor-pointer" data-option="myself">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="text-blue-600 text-xl" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Just me</h3>
                                <p className="text-gray-600">I'm looking to learn something new</p>
                            </div>
                        </div>
                    </div>

                    <div className="learning-option p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-all cursor-pointer" data-option="young-learners">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <ChildIcon className="text-green-600 text-xl" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">My Young Learners</h3>
                                <p className="text-gray-600">Children or teens in my family (under 18)</p>
                            </div>
                        </div>
                    </div>

                    <div className="learning-option p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-all cursor-pointer" data-option="family">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <UsersIcon className="text-purple-600 text-xl" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Both myself and my family</h3>
                                <p className="text-gray-600">Multiple family members will be learning</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <ShieldAltIcon className="mr-2 text-green-500" />
                    We always collect parent/guardian details first for safety and account management
                </div>
            </>
        )
    },
    {
        title: 'Your Account Information',
        icon: <UserShieldIcon />,
        iconBg: 'bg-primary',
        iconColor: 'text-white',
        content: (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <UserShieldIcon className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Account Information</h2>
                    <p className="text-gray-600">Let's start with your details for account security and communication</p>
                </div>
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input type="text" placeholder="Sarah" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input type="text" placeholder="Johnson" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input type="email" placeholder="sarah.johnson@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                        <p className="text-xs text-gray-500 mt-1">We'll use this for session confirmations and important updates</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" placeholder="+44 7123 456789" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                        <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                            <input type="text" placeholder="Postcode" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            </>
        )
    },
    {
        title: "Your Learning Goals",
        icon: <GraduationCapIcon />,
        iconBg: 'bg-green-500',
        iconColor: 'text-white',
        content: (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <GraduationCapIcon className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Learning Goals</h2>
                    <p className="text-gray-600">What would you like to learn? (You can always add more later)</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects I'm interested in</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* Subject options */}
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="music" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <MusicIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Music</div>
                                </div>
                            </label>
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="art" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <PaletteIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Art & Craft</div>
                                </div>
                            </label>
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="languages" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <GlobeIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Languages</div>
                                </div>
                            </label>
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="mindfulness" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <LeafIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Mindfulness</div>
                                </div>
                            </label>
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="coding" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <CodeIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Coding</div>
                                </div>
                            </label>
                            <label className="subject-option cursor-pointer">
                                <input type="checkbox" className="hidden" value="other" />
                                <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                    <PlusIcon className="text-primary mb-2 text-xl" />
                                    <div className="text-sm font-medium">Other</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred learning style</h3>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name="learning-style" value="one-on-one" className="w-4 h-4 text-primary" />
                                    <div>
                                        <div className="font-medium">1-on-1 Sessions</div>
                                        <div className="text-sm text-gray-600">Personalized attention and custom pace</div>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name="learning-style" value="group" className="w-4 h-4 text-primary" />
                                    <div>
                                        <div className="font-medium">Group Classes</div>
                                        <div className="text-sm text-gray-600">Learn with others and share experiences</div>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name="learning-style" value="both" className="w-4 h-4 text-primary" defaultChecked />
                                    <div>
                                        <div className="font-medium">Both</div>
                                        <div className="text-sm text-gray-600">I'm open to different formats</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    {
        title: "Add Young Learners",
        icon: <ChildIcon />,
        iconBg: 'bg-purple-500',
        iconColor: 'text-white',
        content: (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <ChildIcon className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Young Learners</h2>
                    <p className="text-gray-600">Tell us about the children/teens who will be learning</p>
                </div>
                <div id="young-learners-container">
                    <div className="young-learner-profile bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Young Learner #1</h3>
                            <button className="remove-learner text-red-500 hover:text-red-700 text-sm" style={{ display: 'none' }}>
                                <TrashIcon className="mr-1" />
                                Remove
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                    <input type="text" placeholder="Emma" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                                        <option value="">Select age</option>
                                        <option value="5">5 years</option>
                                        <option value="6">6 years</option>
                                        <option value="7">7 years</option>
                                        <option value="8">8 years</option>
                                        <option value="9">9 years</option>
                                        <option value="10">10 years</option>
                                        <option value="11">11 years</option>
                                        <option value="12">12 years</option>
                                        <option value="13">13 years</option>
                                        <option value="14">14 years</option>
                                        <option value="15">15 years</option>
                                        <option value="16">16 years</option>
                                        <option value="17">17 years</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to you</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                                    <option value="">Select relationship</option>
                                    <option value="child">My child</option>
                                    <option value="sibling">My sibling</option>
                                    <option value="grandchild">My grandchild</option>
                                    <option value="other">Other family member</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Interests & subjects they'd like to learn</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {/* Subject options for youth */}
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="music" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <MusicIcon className="text-primary mb-1" />
                                            <div className="font-medium">Music</div>
                                        </div>
                                    </label>
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="art" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <PaletteIcon className="text-primary mb-1" />
                                            <div className="font-medium">Art</div>
                                        </div>
                                    </label>
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="sports" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <RunningIcon className="text-primary mb-1" />
                                            <div className="font-medium">Sports</div>
                                        </div>
                                    </label>
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="languages" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <GlobeIcon className="text-primary mb-1" />
                                            <div className="font-medium">Languages</div>
                                        </div>
                                    </label>
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="coding" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <CodeIcon className="text-primary mb-1" />
                                            <div className="font-medium">Coding</div>
                                        </div>
                                    </label>
                                    <label className="youth-subject-option cursor-pointer">
                                        <input type="checkbox" className="hidden" value="maths" />
                                        <div className="subject-card p-3 border border-gray-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                            <CalculatorIcon className="text-primary mb-1" />
                                            <div className="font-medium">Maths</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    {
        title: "Summary & Confirmation",
        icon: <PlusIcon />, // Placeholder icon, as it was not in the original
        iconBg: 'bg-primary', // Placeholder color
        iconColor: 'text-white',
        content: (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <UsersIcon className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Step: Confirm Your Details</h2>
                    <p className="text-gray-600">Please review your information before completing your profile.</p>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Your Account</h3>
                        <p><strong>Name:</strong> Sarah Johnson</p>
                        <p><strong>Email:</strong> sarah.johnson@email.com</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Young Learners</h3>
                        <p><strong>Emma:</strong> 7 years old, interested in Music, Art, Sports</p>
                    </div>
                </div>
            </>
        )
    },
    {
        title: "Welcome to Roots & Wings",
        icon: <GraduationCapIcon />,
        iconBg: 'bg-green-500',
        iconColor: 'text-white',
        content: (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <GraduationCapIcon className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                    <p className="text-gray-600">Welcome to our learning community. You can now explore all our features.</p>
                </div>
            </>
        )
    }
];

const stepTitles = [
    "Welcome",
    "Your Account Information",
    "Your Learning Goals",
    "Add Young Learners",
    "Summary & Confirmation",
    "Welcome to Roots & Wings"
];

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(1);
    const [learningOption, setLearningOption] = useState(null);
    const [youngLearners, setYoungLearners] = useState([{ id: 1 }]);
    const [isComplete, setIsComplete] = useState(false);
    
    // Total steps for progress bar
    const totalSteps = 6;
    const progressBarWidth = `${(currentStep / totalSteps) * 100}%`;

    useEffect(() => {
        // Handle learning option selection
        const handleOptionClick = (event) => {
            const option = event.currentTarget.dataset.option;
            if (option) {
                setLearningOption(option);
            }
        };

        const options = document.querySelectorAll('.learning-option');
        options.forEach(option => {
            option.addEventListener('click', handleOptionClick);
        });

        return () => {
            options.forEach(option => {
                option.removeEventListener('click', handleOptionClick);
            });
        };
    }, []);

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
            // In a real app, this would redirect to the dashboard
            alert('Welcome to Roots & Wings! Redirecting to your dashboard...');
            window.location.href = '/student-dashboard';
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = (stepNum) => {
        switch (stepNum) {
            case 1:
                return (
                    <div className="step-content p-8" id="step-1">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                                <UsersIcon className="text-white text-2xl" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Who will be learning with Roots & Wings?</h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Help us create the perfect learning experience for you and your family
                            </p>
                            <div className="space-y-4">
                                <div onClick={() => setLearningOption('myself')} className={`learning-option p-6 border-2 rounded-xl transition-all cursor-pointer ${learningOption === 'myself' ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary hover:bg-primary-light'}`}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <UserIcon className="text-blue-600 text-xl" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold text-gray-900">Just me</h3>
                                            <p className="text-gray-600">I'm looking to learn something new</p>
                                        </div>
                                    </div>
                                </div>
                                <div onClick={() => setLearningOption('young-learners')} className={`learning-option p-6 border-2 rounded-xl transition-all cursor-pointer ${learningOption === 'young-learners' ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary hover:bg-primary-light'}`}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <ChildIcon className="text-green-600 text-xl" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold text-gray-900">My Young Learners</h3>
                                            <p className="text-gray-600">Children or teens in my family (under 18)</p>
                                        </div>
                                    </div>
                                </div>
                                <div onClick={() => setLearningOption('family')} className={`learning-option p-6 border-2 rounded-xl transition-all cursor-pointer ${learningOption === 'family' ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary hover:bg-primary-light'}`}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <UsersIcon className="text-purple-600 text-xl" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold text-gray-900">Both myself and my family</h3>
                                            <p className="text-gray-600">Multiple family members will be learning</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 text-sm text-gray-500">
                                <ShieldAltIcon className="mr-2 text-green-500" />
                                We always collect parent/guardian details first for safety and account management
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content p-8" id="step-2">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <UserShieldIcon className="text-white text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Account Information</h2>
                                <p className="text-gray-600">Let's start with your details for account security and communication</p>
                            </div>
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                        <input type="text" placeholder="Sarah" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                        <input type="text" placeholder="Johnson" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <input type="email" placeholder="sarah.johnson@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                    <p className="text-xs text-gray-500 mt-1">We'll use this for session confirmations and important updates</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <input type="tel" placeholder="+44 7123 456789" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                    <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                        <input type="text" placeholder="Postcode" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content p-8" id="step-3">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <GraduationCapIcon className="text-white text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Learning Goals</h2>
                                <p className="text-gray-600">What would you like to learn? (You can always add more later)</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects I'm interested in</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="music" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <MusicIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Music</div>
                                            </div>
                                        </label>
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="art" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <PaletteIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Art & Craft</div>
                                            </div>
                                        </label>
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="languages" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <GlobeIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Languages</div>
                                            </div>
                                        </label>
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="mindfulness" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <LeafIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Mindfulness</div>
                                            </div>
                                        </label>
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="coding" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <CodeIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Coding</div>
                                            </div>
                                        </label>
                                        <label className="subject-option cursor-pointer">
                                            <input type="checkbox" className="hidden" value="other" />
                                            <div className="subject-card p-4 border-2 border-gray-200 rounded-lg text-center hover:border-primary transition-colors">
                                                <PlusIcon className="text-primary mb-2 text-xl" />
                                                <div className="text-sm font-medium">Other</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred learning style</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" name="learning-style" value="one-on-one" className="w-4 h-4 text-primary" />
                                                <div>
                                                    <div className="font-medium">1-on-1 Sessions</div>
                                                    <div className="text-sm text-gray-600">Personalized attention and custom pace</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" name="learning-style" value="group" className="w-4 h-4 text-primary" />
                                                <div>
                                                    <div className="font-medium">Group Classes</div>
                                                    <div className="text-sm text-gray-600">Learn with others and share experiences</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input type="radio" name="learning-style" value="both" className="w-4 h-4 text-primary" defaultChecked />
                                                <div>
                                                    <div className="font-medium">Both</div>
                                                    <div className="text-sm text-gray-600">I'm open to different formats</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="step-content p-8" id="step-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <ChildIcon className="text-white text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Young Learners</h2>
                                <p className="text-gray-600">Tell us about the children/teens who will be learning</p>
                            </div>
                            <div id="young-learners-container">
                                {youngLearners.map((learner, index) => (
                                    <div key={learner.id} className="young-learner-profile bg-gray-50 rounded-xl p-6 mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Young Learner #{index + 1}</h3>
                                            {youngLearners.length > 1 && (
                                                <button onClick={() => removeLearner(learner.id)} className="remove-learner text-red-500 hover:text-red-700 text-sm">
                                                    <TrashIcon className="mr-1" />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                                    <input type="text" placeholder="Emma" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                                                        <option value="">Select age</option>
                                                        {[...Array(13).keys()].map(i => (
                                                            <option key={i + 5} value={i + 5}>{i + 5} years</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to you</label>
                                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                                                    <option value="">Select relationship</option>
                                                    <option value="child">My child</option>
                                                    <option value="sibling">My sibling</option>
                                                    <option value="grandchild">My grandchild</option>
                                                    <option value="other">Other family member</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Interests & subjects they'd like to learn</label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="music" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <MusicIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Music</div>
                                                        </div>
                                                    </label>
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="art" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <PaletteIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Art</div>
                                                        </div>
                                                    </label>
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="sports" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <RunningIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Sports</div>
                                                        </div>
                                                    </label>
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="languages" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <GlobeIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Languages</div>
                                                        </div>
                                                    </label>
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="coding" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <CodeIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Coding</div>
                                                        </div>
                                                    </label>
                                                    <label className="youth-subject-option cursor-pointer">
                                                        <input type="checkbox" className="hidden" value="maths" />
                                                        <div className="subject-card p-3 border border-200 rounded-lg text-center hover:border-primary transition-colors text-xs">
                                                            <CalculatorIcon className="text-primary mb-1" />
                                                            <div className="font-medium">Maths</div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addLearner} id="add-young-learner" className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-primary hover:border-primary transition-colors">
                                <PlusIcon className="w-5 h-5 inline-block mr-2" />
                                Add another young learner
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="step-content p-8" id="step-5">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <UsersIcon className="text-white text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Step: Confirm Your Details</h2>
                                <p className="text-gray-600">Please review your information before completing your profile.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-100 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Your Account</h3>
                                    <p><strong>Name:</strong> Sarah Johnson</p>
                                    <p><strong>Email:</strong> sarah.johnson@email.com</p>
                                </div>
                                <div className="p-4 bg-gray-100 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Young Learners</h3>
                                    <p><strong>Emma:</strong> 7 years old, interested in Music, Art, Sports</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="step-content p-8" id="step-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <GraduationCapIcon className="text-white text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                                <p className="text-gray-600">Welcome to our learning community. You can now explore all our features.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const addLearner = () => {
        setYoungLearners([...youngLearners, { id: youngLearners.length + 1 }]);
    };

    const removeLearner = (idToRemove) => {
        setYoungLearners(youngLearners.filter(learner => learner.id !== idToRemove));
    };

    return (
        <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
                            <span className="ml-4 text-gray-500">Join Our Learning Community</span>
                        </div>
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => window.history.back()}>
                            <TimesIcon className="text-xl" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Step <span id="current-step">{currentStep}</span> of <span id="total-steps">{totalSteps}</span></span>
                            <div className="text-sm text-gray-500" id="step-title">{stepTitles[currentStep - 1]}</div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <SaveIcon className="mr-1 text-green-500" />
                            Progress saved
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-primary h-3 rounded-full transition-all duration-500" id="progress-bar" style={{ width: progressBarWidth }}></div>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-96">
                    {renderStepContent(currentStep)}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    <button onClick={prevStep} className={`px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}>
                        Previous
                    </button>
                    <button onClick={nextStep} className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors">
                        {currentStep === totalSteps ? 'Complete' : 'Next Step'}
                    </button>
                </div>
            </div>
        </div>
    );
}

