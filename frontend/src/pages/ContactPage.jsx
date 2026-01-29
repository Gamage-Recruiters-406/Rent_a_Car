import React from "react";
import { MapPin, Mail, Phone, Headphones } from "lucide-react";
import bgImg from "../assets/ContactUsBG.jpeg";

const ContactPage = () => {
    const contactCards = [
        {
            title: "Address",
            icon: <MapPin className="h-7 w-7 text-white" />,
            lines : ["Colombo,", "Sri Lanka"],
        },
        {
            title: "Mail Us",
            icon: <Mail className="h-7 w-7 text-white" />,
            lines : ["info@rentmycar.lk", "sales@rentmycar.lk"],
        },
        {
            title: "Telephone",
            icon: <Phone className="h-7 w-7 text-white" />,
            lines: ["0773342567", "0777642250"],
        },
        {
            title: "Hotline",
            icon: <Headphones className="h-7 w-7 text-white" />,
            lines: ["0777315095", "0777443552"],
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* HERO */}
            <section className="relative h-[340px] w-full overflow-hidden">
                {/* Background image (replace with your own if needed) */}
                <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImg})` }}
                />

                {/* Hero content */}
                <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
                <div>
                    <h1 className="text-4xl font-semibold tracking-wide text-white md:text-5xl">
                    Contact Us
                    </h1>
                    <p className="mt-4 text-lg text-white/80 md:text-xl">
                    Home / Page / Contact
                    </p>
                </div>
                </div>
            </section>

            {/* SECTION TITLE */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <h2 className="text-center text-2xl font-semibold text-slate-800">
                Contact Us
                </h2>

                {/* CARDS */}
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {contactCards.map((c) => (
                    <div
                    key={c.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                    >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#0B3B8C]">
                        {c.icon}
                    </div>

                    <h3 className="mt-4 text-center text-lg font-semibold text-slate-800">
                        {c.title}
                    </h3>

                    <div className="mt-3 space-y-1 text-center text-sm text-slate-600">
                        {c.lines.map((line, idx) => (
                        <p key={idx}>{line}</p>
                        ))}
                    </div>
                    </div>
                ))}
                </div>

                {/* OPTIONAL: Contact form (if you want, keep it; else delete) */}
                <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">Send a Message</h3>

                <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0B3B8C]"
                    placeholder="Your name"
                    />
                    <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0B3B8C]"
                    placeholder="Your email"
                    type="email"
                    />
                    <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0B3B8C] md:col-span-2"
                    placeholder="Subject"
                    />
                    <textarea
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0B3B8C] md:col-span-2"
                    placeholder="Message"
                    rows={5}
                    />
                    <button
                    type="button"
                    className="rounded-xl bg-[#0B3B8C] px-5 py-3 font-semibold text-white hover:opacity-90 md:col-span-2"
                    >
                    Submit
                    </button>
                </form>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;