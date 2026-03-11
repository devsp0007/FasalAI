"""
Scoring Engine — Applies constraint penalties and bonuses to ML base scores.
Implements the logic from scoring_engine_spec.md.
"""

# ── Crop Master Data ──────────────────────────────────────
CROP_FAMILIES = {
    "rice": "cereals", "wheat": "cereals", "maize": "cereals",
    "barley": "cereals", "millet": "cereals", "jowar": "cereals",
    "bajra": "cereals", "ragi": "cereals",
    "chickpea": "pulses", "lentil": "pulses", "blackgram": "pulses",
    "mungbean": "pulses", "mothbeans": "pulses", "pigeonpeas": "pulses",
    "kidneybeans": "pulses",
    "cotton": "fibers", "jute": "fibers",
    "apple": "fruits", "banana": "fruits", "grapes": "fruits",
    "mango": "fruits", "orange": "fruits", "papaya": "fruits",
    "pomegranate": "fruits", "watermelon": "fruits", "muskmelon": "fruits",
    "coconut": "plantation", "coffee": "plantation",
}

CROP_SEASONS = {
    "rice": ["kharif"], "wheat": ["rabi"], "maize": ["kharif", "rabi"],
    "chickpea": ["rabi"], "lentil": ["rabi"], "blackgram": ["kharif"],
    "mungbean": ["kharif", "zaid"], "cotton": ["kharif"],
    "jute": ["kharif"], "banana": ["kharif", "rabi", "zaid"],
    "apple": ["rabi"], "grapes": ["rabi"],
    "coffee": ["kharif"], "coconut": ["kharif", "rabi", "zaid"],
    "mango": ["kharif"], "orange": ["rabi"],
    "papaya": ["kharif", "zaid"], "watermelon": ["zaid"],
    "muskmelon": ["zaid"], "pomegranate": ["rabi"],
    "pigeonpeas": ["kharif"], "mothbeans": ["kharif"],
    "kidneybeans": ["rabi"],
}

CROP_PH_RANGE = {
    "rice": (5.5, 7.5), "wheat": (6.0, 8.0), "maize": (5.5, 7.5),
    "chickpea": (6.0, 8.0), "lentil": (6.0, 7.5), "cotton": (6.0, 8.0),
    "banana": (5.5, 7.0), "apple": (5.5, 6.5), "coffee": (5.0, 6.5),
    "mango": (5.5, 7.5), "orange": (5.0, 6.5), "grapes": (6.0, 7.5),
    "watermelon": (6.0, 7.0), "coconut": (5.5, 7.0),
}

CROP_TEMP_RANGE = {
    "rice": (20, 37), "wheat": (10, 25), "maize": (18, 35),
    "chickpea": (15, 30), "lentil": (15, 25), "cotton": (20, 40),
    "banana": (20, 35), "apple": (10, 25), "coffee": (15, 30),
    "mango": (24, 40), "orange": (15, 30), "grapes": (15, 35),
}

# Sowing window data (month ranges)
SOWING_WINDOWS = {
    "rice": {"kharif": ("Jun 15", "Jul 15")},
    "wheat": {"rabi": ("Nov 01", "Nov 30")},
    "maize": {"kharif": ("Jun 15", "Jul 15"), "rabi": ("Oct 15", "Nov 15")},
    "chickpea": {"rabi": ("Oct 15", "Nov 15")},
    "lentil": {"rabi": ("Oct 20", "Nov 15")},
    "cotton": {"kharif": ("Apr 15", "May 30")},
    "banana": {"kharif": ("Jun 01", "Jul 15")},
    "mungbean": {"kharif": ("Jun 15", "Jul 15"), "zaid": ("Mar 01", "Apr 15")},
    "blackgram": {"kharif": ("Jun 15", "Jul 30")},
    "mothbeans": {"kharif": ("Jul 01", "Aug 15")},
    "pigeonpeas": {"kharif": ("Jun 01", "Jul 15")},
    "kidneybeans": {"rabi": ("Oct 15", "Nov 15")},
}

# Fertilizer recommendation baselines (N, P, K in kg/ha)
FERTILIZER_BASELINES = {
    "rice": {"N": 120, "P": 60, "K": 60},
    "wheat": {"N": 120, "P": 60, "K": 40},
    "maize": {"N": 120, "P": 60, "K": 40},
    "chickpea": {"N": 20, "P": 40, "K": 20},
    "lentil": {"N": 20, "P": 40, "K": 20},
    "cotton": {"N": 80, "P": 40, "K": 40},
    "banana": {"N": 200, "P": 60, "K": 300},
    "mungbean": {"N": 20, "P": 40, "K": 20},
    "blackgram": {"N": 20, "P": 40, "K": 20},
}


def apply_scoring(base_results: list[dict],
                   previous_crop: str | None = None,
                   season: str = "kharif",
                   ph: float = 6.5,
                   temperature: float = 25.0,
                   nitrogen: float = 80.0,
                   phosphorus: float = 40.0,
                   potassium: float = 40.0) -> list[dict]:
    """
    Apply constraint penalties and bonuses to base ML scores.
    Returns enriched results with adjusted scores, reasons, sowing windows, and fertilizer advice.
    """
    prev_family = CROP_FAMILIES.get(previous_crop, "unknown") if previous_crop else None

    scored_results = []
    for item in base_results:
        crop = item["crop"]
        base_score = item["score"]
        adjustments = []
        reasons = []

        family = CROP_FAMILIES.get(crop, "other")

        # ── Constraint Penalties ───────────────────────
        # Same crop repeat
        if previous_crop and crop == previous_crop:
            adjustments.append({"rule": "same_crop_repeat", "value": -0.30})

        # Same family repeat
        elif prev_family and family == prev_family:
            adjustments.append({"rule": "same_family_penalty", "value": -0.15})

        # pH out of range
        ph_range = CROP_PH_RANGE.get(crop, (5.0, 8.0))
        if ph < ph_range[0] or ph > ph_range[1]:
            adjustments.append({"rule": "ph_out_of_range", "value": -0.20})
        else:
            reasons.append(f"Optimal soil pH ({ph}) within range {ph_range[0]}-{ph_range[1]}")

        # Temperature mismatch
        temp_range = CROP_TEMP_RANGE.get(crop, (10, 40))
        if temperature < temp_range[0] or temperature > temp_range[1]:
            adjustments.append({"rule": "temperature_mismatch", "value": -0.20})
        else:
            reasons.append(f"Suitable temperature ({temperature}°C)")

        # Season mismatch (soft filter, not hard)
        crop_seasons = CROP_SEASONS.get(crop, ["kharif", "rabi", "zaid"])
        if season.lower() not in crop_seasons:
            adjustments.append({"rule": "season_mismatch", "value": -0.50})

        # ── Bonuses ───────────────────────────────────
        # Legume after cereal
        if family == "pulses" and prev_family == "cereals":
            adjustments.append({"rule": "legume_rotation_bonus", "value": 0.10})
            reasons.append(f"Good rotation — legume after cereal improves soil nitrogen")

        # ── Final Score ───────────────────────────────
        adjustment_total = sum(a["value"] for a in adjustments)
        final_score = max(0.0, min(1.0, base_score + adjustment_total))

        # ── Sowing Window ─────────────────────────────
        sowing_data = SOWING_WINDOWS.get(crop, {})
        sowing_window = sowing_data.get(season.lower(), None)
        if not sowing_window:
            # Default sowing window
            if season.lower() == "kharif":
                sowing_window = ("Jun 15", "Jul 30")
            elif season.lower() == "rabi":
                sowing_window = ("Oct 15", "Nov 30")
            else:
                sowing_window = ("Mar 01", "Apr 30")

        # ── Fertilizer Recommendation ─────────────────
        baseline = FERTILIZER_BASELINES.get(crop, {"N": 80, "P": 40, "K": 30})
        fert_n = max(0, baseline["N"] - nitrogen * 0.5)
        fert_p = max(0, baseline["P"] - phosphorus * 0.5)
        fert_k = max(0, baseline["K"] - potassium * 0.5)

        if not reasons:
            reasons.append(f"Model confidence: {item['confidence_pct']}%")

        scored_results.append({
            "rank": item["rank"],
            "crop": crop,
            "crop_family": family,
            "base_score": round(base_score, 4),
            "final_score": round(final_score, 4),
            "confidence_pct": round(final_score * 100, 1),
            "adjustments": adjustments,
            "reason": "; ".join(reasons[:3]) + ".",
            "sowing_window": {
                "start": sowing_window[0],
                "end": sowing_window[1],
            },
            "fertilizer": {
                "nitrogen_kg_ha": round(fert_n, 1),
                "phosphorus_kg_ha": round(fert_p, 1),
                "potassium_kg_ha": round(fert_k, 1),
            },
        })

    # Re-rank by final score
    scored_results.sort(key=lambda x: x["final_score"], reverse=True)
    for i, item in enumerate(scored_results, 1):
        item["rank"] = i

    return scored_results
