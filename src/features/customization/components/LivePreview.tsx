import { useState } from "react";
import { lightenHex, hexToRgba } from "../services/cutomization.services";
import { DBMenuCustomization, FontFamily, ShadowIntensity } from "../types";
import { Eye, Smartphone, Monitor } from "lucide-react";
import { FONT_STACKS, SHADOW_MAP } from "../../menu/constant";

export function LivePreview({ config, hotelName }: { config: Omit<DBMenuCustomization, 'id' | 'hotel_id' | 'created_at' | 'updated_at'>; hotelName: string }) {
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const accentLt = lightenHex(config.accent_color, 0.88);
    const borderColor = hexToRgba(config.text_color, 0.08);

    const previewStyle = {
        '--preview-bg': config.background_color,
        '--preview-surface': config.surface_color,
        '--preview-text': config.text_color,
        '--preview-accent': config.accent_color,
        '--preview-accentlt': accentLt,
        '--preview-muted': config.muted_color,
        '--preview-border': borderColor,
        '--preview-font': FONT_STACKS[config.font_family],
        '--preview-radius': `${config.border_radius}px`,
        '--preview-shadow': SHADOW_MAP[config.shadow_intensity],
    } as React.CSSProperties;

    const previewItems = [
        {
            name: "Paneer Tikka",
            price: 220,
            tag: "veg",
            desc: "Soft cottage cheese marinated in spices",
            emoji: "🥗",
        },
        {
            name: "Chicken Wings",
            price: 340,
            tag: "non-veg",
            desc: "Crispy wings with house sauce",
            emoji: "🍗",
        },
        {
            name: "Margherita Pizza",
            price: 390,
            tag: "veg",
            desc: "Fresh mozzarella with basil",
            emoji: "🍕",
        },
        {
            name: "Veg Hakka Noodles",
            price: 210,
            tag: "veg",
            desc: "Stir-fried noodles with vegetables",
            emoji: "🍜",
        },
        {
            name: "Butter Chicken",
            price: 360,
            tag: "non-veg",
            desc: "Creamy tomato gravy with chicken",
            emoji: "🍛",
        },
        {
            name: "Chocolate Brownie",
            price: 180,
            tag: "veg",
            desc: "Warm brownie served with chocolate sauce",
            emoji: "🍰",
        },
    ];

    return (
        <div className=" top-6">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {/* Preview toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                    <span className="text-xs font-bold text-theme2 flex items-center gap-1.5">
                        <Eye size={12} /> Live Preview
                    </span>
                    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--border)' }}>
                        {([['mobile', Smartphone], ['desktop', Monitor]] as const).map(([mode, Icon]) => (
                            <button key={mode} onClick={() => setPreviewMode(mode)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                style={{
                                    background: previewMode === mode ? 'var(--card)' : 'transparent',
                                    color: previewMode === mode ? 'var(--text)' : 'var(--text3)',
                                }}>
                                <Icon size={11} /> {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Phone/Desktop frame */}
                <div className="p-4 flex justify-center" style={{ background: 'var(--bg3)' }}>
                    <div
                        className={`overflow-hidden transition-all duration-300 ${previewMode === 'mobile' ? 'w-[340px]' : 'w-full'}`}
                        style={{
                            ...previewStyle,
                            borderRadius: previewMode === 'mobile' ? '24px' : '12px',
                            border: previewMode === 'mobile' ? '8px solid #1C1008' : '1px solid var(--border2)',
                            maxHeight: 550,
                            overflow: 'auto',
                        }}>
                        <div style={{ background: 'var(--preview-bg)', fontFamily: 'var(--preview-font)', maxHeight: 750, overflowY: 'auto' }}>
                            {/* Header */}
                            <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid var(--preview-border)` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    {config.show_logo && (
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'calc(var(--preview-radius) - 2px)',
                                            background: 'var(--preview-accentlt)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <span style={{ color: 'var(--preview-accent)', fontWeight: 700, fontSize: 14 }}>
                                                {hotelName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: config.heading_weight, fontSize: config.base_font_size * 0.9, color: 'var(--preview-text)', lineHeight: 1.2 }}>
                                            {hotelName}
                                        </div>
                                        {config.show_address && (
                                            <div style={{ fontSize: 10, color: 'var(--preview-muted)', marginTop: 2 }}>
                                                📍 123, Sample Street
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {config.show_search && (
                                    <div style={{
                                        background: 'var(--preview-surface)',
                                        border: `1px solid var(--preview-border)`,
                                        borderRadius: 'var(--preview-radius)',
                                        padding: '7px 12px',
                                        fontSize: 11,
                                        color: 'var(--preview-muted)',
                                        boxShadow: 'var(--preview-shadow)',
                                    }}>
                                        🔍 Search dishes, drinks…
                                    </div>
                                )}
                            </div>

                            {config.show_categories && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        padding: "10px 14px",
                                        borderBottom: `1px solid var(--preview-border)`,
                                        overflowX: "hidden",
                                    }}
                                >
                                    {["Starters", "Mains", "Drinks", "Desserts"].map((cat, i) => {
                                        const active = i === 0;

                                        return (
                                            <div
                                                key={cat}
                                                style={{
                                                    padding:
                                                        config.category_style === "underline"
                                                            ? "0 0 6px"
                                                            : "4px 10px",

                                                    borderRadius:
                                                        config.category_style === "pill"
                                                            ? 999
                                                            : config.category_style === "card"
                                                                ? 8
                                                                : 0,

                                                    background:
                                                        config.category_style === "underline"
                                                            ? "transparent"
                                                            : active
                                                                ? "var(--preview-accent)"
                                                                : "transparent",

                                                    color: active
                                                        ? config.category_style === "underline"
                                                            ? "var(--preview-accent)"
                                                            : "#fff"
                                                        : "var(--preview-muted)",

                                                    border:
                                                        config.category_style === "underline"
                                                            ? "none"
                                                            : `1px solid ${active
                                                                ? "var(--preview-accent)"
                                                                : "var(--preview-border)"
                                                            }`,

                                                    borderBottom:
                                                        config.category_style === "underline"
                                                            ? `2px solid ${active
                                                                ? "var(--preview-accent)"
                                                                : "transparent"
                                                            }`
                                                            : "none",

                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {cat}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Menu items */}

                            {config.menu_layout === 'card' ? (
                                <div className="grid grid-cols-2 p-3 gap-4">
                                    {previewItems.map((item) => (
                                        <div key={item.name} className="flex flex-col gap-3" style={{
                                            padding: 10,
                                            background: 'var(--preview-surface)',
                                            borderRadius: 'var(--preview-radius)',
                                            border: `1px solid var(--preview-border)`,
                                            boxShadow: 'var(--preview-shadow)',
                                        }} >
                                            {config.show_item_images && (
                                                <div style={{
                                                    width: 52, height: 52, borderRadius: `calc(var(--preview-radius) - 4px)`,
                                                    background: 'var(--preview-accentlt)',
                                                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 20,
                                                }}>
                                                    {item.tag === 'veg' ? '🥗' : '🍗'}
                                                </div>
                                            )}

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                                    {config.show_dietary_badge && (
                                                        <div style={{
                                                            width: 12, height: 12, borderRadius: 2,
                                                            border: `1.5px solid ${item.tag === 'veg' ? '#16a34a' : '#dc2626'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <div style={{
                                                                width: 5, height: 5, borderRadius: '50%',
                                                                background: item.tag === 'veg' ? '#16a34a' : '#dc2626',
                                                            }} />
                                                        </div>
                                                    )}
                                                    <span style={{ fontSize: 11, fontWeight: config.heading_weight, color: 'var(--preview-text)' }}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {config.show_descriptions && (
                                                    <p style={{ fontSize: 9, color: 'var(--preview-muted)', marginBottom: 4, lineHeight: 1.4 }}>
                                                        {item.desc}
                                                    </p>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--preview-accent)' }}>₹{item.price}</span>
                                                    {config.show_tags && (
                                                        <span style={{
                                                            fontSize: 8, padding: '2px 6px',
                                                            borderRadius: 99, background: 'var(--preview-accentlt)',
                                                            color: 'var(--preview-accent)', fontWeight: 600,
                                                        }}>
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : config.menu_layout === 'list' ? (
                                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {previewItems.map((item) => (
                                        <div key={item.name} style={{
                                            display: 'flex', gap: 8, padding: 10,
                                            background: 'var(--preview-surface)',
                                            borderRadius: 'var(--preview-radius)',
                                            border: `1px solid var(--preview-border)`,
                                            boxShadow: 'var(--preview-shadow)',
                                        }}>
                                            {config.show_item_images && (
                                                <div style={{
                                                    width: 52, height: 52, borderRadius: `calc(var(--preview-radius) - 4px)`,
                                                    background: 'var(--preview-accentlt)',
                                                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 20,
                                                }}>
                                                    {item.tag === 'veg' ? '🥗' : '🍗'}
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 220 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                                    {config.show_dietary_badge && (
                                                        <div style={{
                                                            width: 12, height: 12, borderRadius: 2,
                                                            border: `1.5px solid ${item.tag === 'veg' ? '#16a34a' : '#dc2626'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <div style={{
                                                                width: 5, height: 5, borderRadius: '50%',
                                                                background: item.tag === 'veg' ? '#16a34a' : '#dc2626',
                                                            }} />
                                                        </div>
                                                    )}
                                                    <span style={{ fontSize: 11, fontWeight: config.heading_weight, color: 'var(--preview-text)' }}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {config.show_descriptions && (
                                                    <p style={{ fontSize: 9, color: 'var(--preview-muted)', marginBottom: 4, lineHeight: 1.4 }}>
                                                        {item.desc}
                                                    </p>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--preview-accent)' }}>₹{item.price}</span>
                                                    {config.show_tags && (
                                                        <span style={{
                                                            fontSize: 8, padding: '2px 6px',
                                                            borderRadius: 99, background: 'var(--preview-accentlt)',
                                                            color: 'var(--preview-accent)', fontWeight: 600,
                                                        }}>
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {previewItems.map((item) => (
                                        <div key={item.name} style={{
                                            display: 'flex', gap: 8, padding: 10,
                                            background: 'var(--preview-surface)',
                                            borderRadius: 'var(--preview-radius)',
                                            border: `1px solid var(--preview-border)`,
                                            boxShadow: 'var(--preview-shadow)',
                                        }}>

                                            <div style={{ flex: 1, minWidth: 280 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2, justifyContent: 'space-between' }}>
                                                    <div className="flex items-center gap-2">
                                                        {config.show_dietary_badge && (
                                                            <div style={{
                                                                width: 12, height: 12, borderRadius: 2,
                                                                border: `1.5px solid ${item.tag === 'veg' ? '#16a34a' : '#dc2626'}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <div style={{
                                                                    width: 5, height: 5, borderRadius: '50%',
                                                                    background: item.tag === 'veg' ? '#16a34a' : '#dc2626',
                                                                }} />
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: 11, fontWeight: config.heading_weight, color: 'var(--preview-text)' }}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--preview-accent)' }}>₹{item.price}</span>
                                                </div>
                                                {config.show_descriptions && (
                                                    <p style={{ fontSize: 9, color: 'var(--preview-muted)', lineHeight: 1.4 }}>
                                                        {item.desc}
                                                    </p>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}




                            {/* Footer */}
                            {config.show_scanify_badge && (
                                <div style={{
                                    borderTop: `1px solid var(--preview-border)`,
                                    padding: '8px 14px',
                                    display: 'flex', justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontSize: 9, padding: '3px 10px',
                                        borderRadius: 99, background: 'var(--preview-accentlt)',
                                        color: 'var(--preview-accent)', fontWeight: 600,
                                        border: `1px solid var(--preview-accent)`,
                                    }}>
                                        ◼ Powered by Scanify
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}