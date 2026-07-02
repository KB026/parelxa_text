import re
import os

data_ts_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'data.ts')

with open(data_ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace "has_india_pricing" to "global_availability"
content = content.replace("has_india_pricing", "global_availability")

# 2. Replace "inr_price" to "usd_price"
content = content.replace("inr_price", "usd_price")

# 3. Replace India related words down
content = content.replace("India's", "The world's")
content = content.replace("Indian context", "global context")
content = content.replace("Indian businesses", "global businesses")
content = content.replace("Bharat", "Global Enterprises")
content = content.replace("in India", "worldwide")
content = content.replace("for India", "globally")
content = content.replace("Indian dialects", "global dialects")
content = content.replace("Indian languages", "multiple languages")
content = content.replace("Indian", "global")

# 4. Price conversion
def convert_price(match):
    amount_str = match.group(1).replace(',', '')
    try:
        inr_amount = int(amount_str)
        usd_amount = round(inr_amount / 83.0)
        
        if usd_amount > 1000:
            usd_amount = round(usd_amount / 100) * 100
        elif usd_amount > 100:
            usd_amount = round(usd_amount / 10) * 10
        elif usd_amount > 50:
            usd_amount = round(usd_amount / 5) * 5
            
        if usd_amount == 0 and inr_amount > 0:
            usd_amount = 1
            
        return '$' + f"{usd_amount:,}"
    except ValueError:
        return match.group(0)

# match "₹" followed by digits and commas
content = re.sub(r'₹([0-9,]+)', convert_price, content)

with open(data_ts_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully globalized lib/data.ts using Python')
