"""
Real FIFA World Cup 2026 data (USA · Canada · Mexico).
Final draw held 5 Dec 2025, Washington D.C. — 48 teams, 12 groups (A–L).
Player pools for the Golden Boot (forwards) and Golden Glove (goalkeepers)
are real internationals from qualified squads. Ratings are indicative form
ratings used purely for the prediction-card UI.
"""

# Bump this when the dataset below changes to trigger a reseed.
SEED_VERSION = "wc2026-v2"

# Real WC2026 host stadiums (16 venues across Canada, Mexico & the USA).
VENUES = [
    "MetLife Stadium, New York/NJ", "SoFi Stadium, Los Angeles", "AT&T Stadium, Dallas",
    "Mercedes-Benz Stadium, Atlanta", "NRG Stadium, Houston", "Lincoln Financial Field, Philadelphia",
    "Levi's Stadium, San Francisco Bay", "Lumen Field, Seattle", "Arrowhead Stadium, Kansas City",
    "Gillette Stadium, Boston", "Hard Rock Stadium, Miami", "Lincoln Financial Field, Philadelphia",
    "Estadio Azteca, Mexico City", "Estadio Akron, Guadalajara", "Estadio BBVA, Monterrey",
    "BMO Field, Toronto", "BC Place, Vancouver",
]

# (code, name, flag_code) — flag_code feeds https://flagcdn.com
WC_GROUPS = {
    "A": [("cz", "Czechia", "cz"), ("mx", "Mexico", "mx"), ("za", "South Africa", "za"), ("kr", "South Korea", "kr")],
    "B": [("ba", "Bosnia & Herz.", "ba"), ("ca", "Canada", "ca"), ("qa", "Qatar", "qa"), ("ch", "Switzerland", "ch")],
    "C": [("br", "Brazil", "br"), ("ht", "Haiti", "ht"), ("ma", "Morocco", "ma"), ("sct", "Scotland", "gb-sct")],
    "D": [("au", "Australia", "au"), ("py", "Paraguay", "py"), ("tr", "Türkiye", "tr"), ("us", "United States", "us")],
    "E": [("cw", "Curaçao", "cw"), ("ec", "Ecuador", "ec"), ("de", "Germany", "de"), ("ci", "Ivory Coast", "ci")],
    "F": [("jp", "Japan", "jp"), ("nl", "Netherlands", "nl"), ("se", "Sweden", "se"), ("tn", "Tunisia", "tn")],
    "G": [("be", "Belgium", "be"), ("eg", "Egypt", "eg"), ("ir", "Iran", "ir"), ("nz", "New Zealand", "nz")],
    "H": [("cv", "Cape Verde", "cv"), ("sa", "Saudi Arabia", "sa"), ("es", "Spain", "es"), ("uy", "Uruguay", "uy")],
    "I": [("fr", "France", "fr"), ("iq", "Iraq", "iq"), ("no", "Norway", "no"), ("sn", "Senegal", "sn")],
    "J": [("dz", "Algeria", "dz"), ("ar", "Argentina", "ar"), ("at", "Austria", "at"), ("jo", "Jordan", "jo")],
    "K": [("co", "Colombia", "co"), ("cd", "DR Congo", "cd"), ("pt", "Portugal", "pt"), ("uz", "Uzbekistan", "uz")],
    "L": [("hr", "Croatia", "hr"), ("eng", "England", "gb-eng"), ("gh", "Ghana", "gh"), ("pa", "Panama", "pa")],
}

# Golden Boot candidates — (name, team_code, club, rating)
BOOT_PLAYERS = [
    ("Kylian Mbappé", "fr", "Real Madrid", 94),
    ("Erling Haaland", "no", "Manchester City", 93),
    ("Lionel Messi", "ar", "Inter Miami", 92),
    ("Vinícius Júnior", "br", "Real Madrid", 90),
    ("Harry Kane", "eng", "Bayern Munich", 91),
    ("Lautaro Martínez", "ar", "Inter Milan", 89),
    ("Lamine Yamal", "es", "FC Barcelona", 89),
    ("Cristiano Ronaldo", "pt", "Al Nassr", 88),
    ("Mohamed Salah", "eg", "Liverpool", 89),
    ("Julián Álvarez", "ar", "Atlético Madrid", 88),
    ("Rafael Leão", "pt", "AC Milan", 86),
    ("Cody Gakpo", "nl", "Liverpool", 85),
    ("Romelu Lukaku", "be", "Napoli", 85),
    ("Nico Williams", "es", "FC Barcelona", 86),
    ("Darwin Núñez", "uy", "Al Hilal", 84),
    ("Rodrygo", "br", "Real Madrid", 86),
    ("Youssef En-Nesyri", "ma", "Fenerbahçe", 83),
    ("Son Heung-min", "kr", "LAFC", 86),
    ("Christian Pulisic", "us", "AC Milan", 85),
    ("Kaoru Mitoma", "jp", "Brighton", 83),
]

# Golden Glove candidates — (name, team_code, club, rating)
GLOVE_PLAYERS = [
    ("Emiliano Martínez", "ar", "Aston Villa", 90),
    ("Alisson Becker", "br", "Liverpool", 90),
    ("Thibaut Courtois", "be", "Real Madrid", 91),
    ("Mike Maignan", "fr", "AC Milan", 88),
    ("Jordan Pickford", "eng", "Everton", 86),
    ("Unai Simón", "es", "Athletic Club", 86),
    ("Yann Sommer", "ch", "Inter Milan", 85),
    ("Diogo Costa", "pt", "FC Porto", 86),
    ("Marc-André ter Stegen", "de", "FC Barcelona", 88),
    ("Yassine Bounou", "ma", "Al Hilal", 85),
    ("Bart Verbruggen", "nl", "Brighton", 83),
    ("Guillermo Ochoa", "mx", "AVS", 82),
]
