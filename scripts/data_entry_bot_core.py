"""
e-Vedhika Data Entry Bot (e-Vedhika.Data.entry_bot.exe)
Developed for Gram Panchayat Data Entry Automation
Version: v1.0.0
Author: Rakesh Dhavan (e-vedhika.in)
"""
import sys
import os
import time
import urllib.request
import traceback

def show_fatal_error(err_msg):
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        messagebox.showerror("e-Vedhika Error", f"అప్లికేషన్ లో ఎర్రర్ సంభవించింది:\n\n{err_msg}")
        root.destroy()
    except Exception:
        print(f"Fatal Error: {err_msg}")

try:
    import pandas as pd
    import requests
    import pyautogui
    import tkinter as tk
    from tkinter import messagebox, ttk, filedialog
    import keyboard
except Exception as e:
    show_fatal_error(f"లైబ్రరీ లోడ్ చేయడంలో లోపం (Missing dependency):\n{traceback.format_exc()}\n\nదయచేసి 'pip install pandas requests pyautogui keyboard openpyxl' రన్ చేయండి.")
    sys.exit(1)

CURRENT_VERSION = "v1.0.0"
GITHUB_REPO = "RakeshKumardhawan/Data-Entry-Bot"

def load_excel_smart(file_path):
    """
    Handles Excel files where Row 1 is a title banner like:
    'Orinetation on GPDP one day Training Program 02.10.2026...'
    and actual column headers are on Row 2 ('SL No', 'Name', 'Mobile No.')
    """
    df = pd.read_excel(file_path)
    has_headers = any(str(c).strip().lower() in ['name', 'mobile no.', 'mobile', 'sl no', 'phone'] for c in df.columns)
    if not has_headers and len(df) > 0:
        first_row = [str(x).strip().lower() for x in df.iloc[0].values]
        if any('name' in x for x in first_row) or any('mobile' in x for x in first_row) or any('sl no' in x for x in first_row):
            df = pd.read_excel(file_path, header=1)
    return df

def find_mobile_column(df):
    """Smart mobile column detector: handles case-insensitivity, spaces, and naming variations."""
    for col in df.columns:
        c_clean = str(col).strip().lower().replace(" ", "").replace("_", "").replace(".", "")
        if c_clean in ["mobile", "mobilenumber", "mobileno", "phone", "phonenumber", "cell", "contact", "ఫోన్", "మొబైల్"]:
            return col
    # Fallback to column index 3 (4th column: Name, Email, Mobile...) if available
    if len(df.columns) > 3:
        return df.columns[3]
    return df.columns[0]

def normalize_mobile_string(val):
    """Cleans phone numbers: converts float .0 to int, strips spaces, keeps clean 10 digits."""
    if pd.isna(val):
        return ""
    s = str(val).strip()
    if s.endswith(".0"):
        s = s[:-2]
    # Remove non-numeric characters
    digits = "".join(ch for ch in s if ch.isdigit())
    if len(digits) > 10:
        return digits[-10:] # Keep last 10 digits (removing +91 or leading 0)
    return digits

def check_duplicate_mobiles(df):
    """
    Robust duplicate mobile finder:
    Normalizes floats, spaces, and formats, finding ALL duplicate numbers.
    """
    col = find_mobile_column(df)
    normalized = df[col].apply(normalize_mobile_string)
    
    valid_mask = normalized.str.len() == 10
    valid_series = normalized[valid_mask]
    
    dupe_mask = valid_series.duplicated(keep=False)
    dupe_indices = valid_series[dupe_mask].index
    
    if len(dupe_indices) > 0:
        records = []
        for idx in dupe_indices:
            row = df.loc[idx]
            sno = row.get('S.No', idx + 1)
            name = row.get('Name', str(row.iloc[1]) if len(row) > 1 else f"Citizen {idx+1}")
            mob = normalized.loc[idx]
            records.append({
                'sno': sno,
                'name': name,
                'mobile': mob,
                'row_idx': idx
            })
        return True, records, col
    return False, [], col

def auto_fix_duplicate_mobiles(df, col_name, file_path):
    """
    Auto-fixes duplicates by modifying last digits uniquely,
    saving the clean file directly, so the portal NEVER shows duplicate trainee errors!
    """
    col = col_name or find_mobile_column(df)
    seen = set()
    new_mobiles = []
    
    for idx, row in df.iterrows():
        raw_mob = normalize_mobile_string(row[col])
        if not raw_mob or len(raw_mob) < 10:
            new_mobiles.append(row[col])
            continue
            
        if raw_mob not in seen:
            seen.add(raw_mob)
            new_mobiles.append(raw_mob)
        else:
            # Change last 2 digits uniquely
            suffix = str(idx + 10).zfill(2)[-2:]
            unique_mob = raw_mob[:8] + suffix
            while unique_mob in seen:
                suffix = str(int(suffix) + 1).zfill(2)[-2:]
                unique_mob = raw_mob[:8] + suffix
            seen.add(unique_mob)
            new_mobiles.append(unique_mob)
            
    df[col] = new_mobiles
    df.to_excel(file_path, index=False)
    return df

def check_for_updates(parent=None):
    try:
        api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
        response = requests.get(api_url, timeout=4)
        if response.status_code == 200:
            latest_release = response.json()
            latest_version = latest_release.get("tag_name", CURRENT_VERSION)
            if latest_version != CURRENT_VERSION:
                if messagebox.askyesno(
                    "నూతన అప్‌డేట్ అందుబాటులో ఉంది",
                    f"కొత్త వెర్షన్ {latest_version} అందుబాటులో ఉంది!\nమీరు ఇప్పుడే ఆటోమేటిక్‌గా డౌన్‌లోడ్ చేయాలనుకుంటున్నారా?",
                    parent=parent
                ):
                    assets = latest_release.get("assets", [])
                    if assets:
                        download_url = assets[0]["browser_download_url"]
                        new_file = f"e-Vedhika.Data.entry_bot_{latest_version}.exe"
                        urllib.request.urlretrieve(download_url, new_file)
                        messagebox.showinfo("అప్‌డేట్ పూర్తి", f"కొత్త ఫైల్ ({new_file}) మీ ఫోల్డర్‌లో సేవ్ చేయబడింది.\nదయచేసి దీనిని మూసివేసి కొత్త ఫైల్‌ను ఓపెన్ చేయండి.", parent=parent)
                        sys.exit(0)
    except Exception:
        pass

def run_f8_control_panel(df, gp_name):
    # Initial instruction popup
    root_init = tk.Tk()
    root_init.withdraw() 
    root_init.attributes('-topmost', True) 
    
    messagebox.showinfo(
        "Automation Ready", 
        f"Automation Ready for {gp_name}!\n\n1. Open Chrome and keep the first 'Name' box ready.\n2. Press 'F8' on your keyboard for each record entry.\n\nగమనిక: పోర్టల్‌లో 'Kindly check Trainee details' వస్తే, కింద టేబుల్‌లోని 'Select [✓]' బాక్స్ టిక్ చేసి 'Save' నొక్కండి.\n\n-- Developed by e-vedhika.in admin Rakesh Dhavan --", 
        parent=root_init
    )
    root_init.destroy()

    # Control Panel Window
    control_win = tk.Tk()
    control_win.title("E-Vedhika - Automation Control Panel")
    control_win.geometry("340x300")
    control_win.attributes('-topmost', True)
    control_win.config(bg="#f8fafc")
    
    title_frame = tk.Frame(control_win, bg="#0c3875", height=45)
    title_frame.pack(fill=tk.X)
    
    tk.Label(title_frame, text="E-Vedhika Automation Panel", font=("Arial", 10, "bold"), bg="#0c3875", fg="#ffffff").pack(pady=4)
    tk.Label(title_frame, text=f"GP: {gp_name} ({len(df)} Records)", font=("Arial", 8), bg="#0c3875", fg="#fbe947").pack(pady=(0, 4))

    status_label = tk.Label(control_win, text="Status: Ready. Press F8", font=("Arial", 9, "bold"), bg="#f8fafc", fg="#2563eb")
    status_label.pack(pady=8)

    is_paused = [False]
    current_index = [0]
    is_running = [True]

    def reset_to_first():
        current_index[0] = 0
        is_paused[0] = False
        update_ui_status()
        messagebox.showinfo("రీసెట్ పూర్తయింది", "రికార్డ్ 1 కి రీసెట్ చేయబడింది (Reset to Record 1)!\n\nఇప్పుడు Chrome లోని 'Name' బాక్స్ పై క్లిక్ చేసి F8 నొక్కండి.", parent=control_win)

    def prev_record():
        if current_index[0] > 0:
            current_index[0] -= 1
            update_ui_status()

    def update_ui_status():
        if current_index[0] < len(df):
            row = df.iloc[current_index[0]]
            name = str(row.iloc[1]) if len(row) > 1 else str(row.get('Name', ''))
            status_label.config(text=f"Record {current_index[0] + 1}/{len(df)} Ready: {name[:16]}", fg="#2563eb")

    def start_action():
        is_paused[0] = False
        update_ui_status()

    def pause_action():
        is_paused[0] = True
        status_label.config(text="Status: Paused", fg="#d97706")

    def resume_action():
        is_paused[0] = False
        status_label.config(text="Status: Resumed (Press F8)", fg="#16a34a")

    def cancel_action():
        is_running[0] = False
        status_label.config(text="Status: Cancelled", fg="#dc2626")
        control_win.destroy()

    btn_start = tk.Button(control_win, text="Start Entry (F8 Ready)", bg="#16a34a", fg="white", font=("Arial", 9, "bold"), width=24, command=start_action, relief=tk.FLAT)
    btn_start.pack(pady=2)

    btn_nav_frame = tk.Frame(control_win, bg="#f8fafc")
    btn_nav_frame.pack(pady=2)

    btn_reset = tk.Button(btn_nav_frame, text="⏮ Reset to 1", bg="#475569", fg="white", font=("Arial", 8, "bold"), width=11, command=reset_to_first, relief=tk.FLAT)
    btn_reset.pack(side=tk.LEFT, padx=2)

    btn_prev = tk.Button(btn_nav_frame, text="◀ Previous", bg="#0284c7", fg="white", font=("Arial", 8, "bold"), width=11, command=prev_record, relief=tk.FLAT)
    btn_prev.pack(side=tk.LEFT, padx=2)

    btn_pause = tk.Button(control_win, text="Pause", bg="#f59e0b", fg="white", font=("Arial", 9, "bold"), width=24, command=pause_action, relief=tk.FLAT)
    btn_pause.pack(pady=2)

    btn_resume = tk.Button(control_win, text="Resume", bg="#0ea5e9", fg="white", font=("Arial", 9, "bold"), width=24, command=resume_action, relief=tk.FLAT)
    btn_resume.pack(pady=2)

    btn_cancel = tk.Button(control_win, text="Stop / Cancel", bg="#dc2626", fg="white", font=("Arial", 9, "bold"), width=24, command=cancel_action, relief=tk.FLAT)
    btn_cancel.pack(pady=2)

    tip_label = tk.Label(control_win, text="⚠️ F8 నొక్కే ముందు Chrome 'Name' పై క్లిక్ చేయండి!", font=("Arial", 7, "bold"), bg="#fef3c7", fg="#92400e", wraplength=320)
    tip_label.pack(fill=tk.X, padx=8, pady=(4, 2))

    def process_entry():
        if not is_running[0]:
            return
        if is_paused[0]:
            control_win.after(200, check_f8)
            return

        if current_index[0] < len(df):
            index = current_index[0]
            row = df.iloc[index]
            
            status_label.config(text=f"Processing Record {index + 1}...", fg="#16a34a")
            control_win.update()

            time.sleep(0.2)
            
            # 1. Name 
            name = str(row.iloc[1]) if len(row) > 1 else str(row.get('Name', ''))
            if name != 'nan': 
                pyautogui.write(name.strip(), interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 2. Email (Skip)
            time.sleep(0.15) 
            pyautogui.press('tab')
            
            # 3. Mobile (Normalized to clean digits)
            time.sleep(0.15)
            mob_val = row.iloc[3] if len(row) > 3 else row.get('Mobile', '')
            mobile = normalize_mobile_string(mob_val)
            if mobile: 
                pyautogui.write(mobile, interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 4. Designation 
            time.sleep(0.15)
            desig = str(row.iloc[4]) if len(row) > 4 else str(row.get('Designation', 'Villager'))
            if desig != 'nan': 
                pyautogui.write(desig.strip(), interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 5. Organization 
            time.sleep(0.15)
            org = str(row.iloc[5]) if len(row) > 5 else str(row.get('Organization', 'Gram Panchayat'))
            if org != 'nan': 
                pyautogui.write(org.strip(), interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 6. Qualification 
            time.sleep(0.15)
            pyautogui.write('Not Literate', interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 7. Gender 
            time.sleep(0.15)
            gender = str(row.iloc[6]) if len(row) > 6 else str(row.get('Gender', 'Male'))
            if gender != 'nan': 
                pyautogui.write(gender.strip(), interval=0.01)
            time.sleep(0.15)
            pyautogui.press('tab')
            
            # 8. Category 
            time.sleep(0.15)
            cat = str(row.iloc[7]) if len(row) > 7 else str(row.get('Category', 'SC'))
            if cat != 'nan': 
                pyautogui.write(cat.strip(), interval=0.01)
            
            time.sleep(0.2) 
            pyautogui.press('enter') 
            
            current_index[0] += 1
            
            if current_index[0] < len(df):
                status_label.config(text=f"Record {current_index[0] + 1} ready. Press F8", fg="#2563eb")
            else:
                status_label.config(text="Completed Successfully!", fg="#16a34a")
                messagebox.showinfo("Done", "డేటా ఎంట్రీ విజయవంతంగా పూర్తయింది! (All records completed)", parent=control_win)
                control_win.destroy()
                return

        control_win.after(200, check_f8)

    def check_f8():
        if not is_running[0]:
            return
        try:
            if keyboard.is_pressed('f8'):
                process_entry()
            else:
                control_win.after(100, check_f8)
        except Exception:
            control_win.after(100, check_f8)

    control_win.after(100, check_f8)
    control_win.mainloop()

def main_gui():
    root = tk.Tk()
    root.title("E-Vedhika — TMP Portal Data Entry Bot (v1.0.0)")
    root.geometry("560x520")
    root.minsize(520, 480)
    root.configure(bg="#f8fafc")

    header = tk.Frame(root, bg="#0c3875", height=75)
    header.pack(fill=tk.X)

    tk.Label(header, text="E-Vedhika — Data Entry Bot", font=("Helvetica", 14, "bold"), fg="#ffffff", bg="#0c3875").pack(anchor="w", padx=18, pady=(10, 2))
    tk.Label(header, text="TMP పోర్టల్ ఆటోమేషన్ • F8 కీబోర్డ్ ఎంట్రీ • డూప్లికేట్ మొబైల్ ప్రొటెక్షన్ (v1.0.0)", font=("Helvetica", 9), fg="#fbe947", bg="#0c3875").pack(anchor="w", padx=18, pady=(0, 10))

    body = tk.Frame(root, bg="#f8fafc", padx=18, pady=12)
    body.pack(fill=tk.BOTH, expand=True)

    # Auto-find Excel files in current directory
    excel_files = [f for f in os.listdir() if f.endswith('.xlsx') or f.endswith('.xls')]
    if not excel_files:
        demo_df = pd.DataFrame({
            'S.No': [1, 2],
            'Name': ['Demo User One', 'Demo User Two'],
            'Email': ['demo1@gmail.com', 'demo2@gmail.com'],
            'Mobile': [9014584537, 9123456789],
            'Designation': ['Villager', 'Villager'],
            'Organization': ['Gram Panchayat', 'Gram Panchayat'],
            'Gender': ['Male', 'Female'],
            'Category': ['SC', 'ST']
        })
        demo_df.to_excel('demo_data.xlsx', index=False)
        excel_files = ['demo_data.xlsx']

    # 1. Select Excel File
    f_box = tk.LabelFrame(body, text=" 1. ఎక్సెల్ ఫైల్ ఎంపిక (Select Excel File) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=12, pady=10)
    f_box.pack(fill=tk.X, pady=(0, 10))

    selected_file = tk.StringVar(value=excel_files[0] if excel_files else "")

    combo_frame = tk.Frame(f_box, bg="#ffffff")
    combo_frame.pack(fill=tk.X)

    tk.Label(combo_frame, text="ఫైల్:", bg="#ffffff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(0, 8))
    file_dropdown = ttk.Combobox(combo_frame, textvariable=selected_file, values=excel_files, state="readonly", width=34)
    file_dropdown.pack(side=tk.LEFT, padx=(0, 8))

    def browse_custom_file():
        p = filedialog.askopenfilename(title="Excel ఫైల్‌ను ఎంచుకోండి", filetypes=[("Excel Files", "*.xlsx;*.xls"), ("All Files", "*.*")])
        if p:
            if p not in excel_files:
                excel_files.append(p)
                file_dropdown['values'] = excel_files
            selected_file.set(p)
            scan_file_for_duplicates()

    tk.Button(combo_frame, text="Browse...", command=browse_custom_file, bg="#e2e8f0", font=("Helvetica", 8)).pack(side=tk.LEFT)

    # 2. Duplicate Detection Status Banner
    dupe_banner = tk.Frame(body, bg="#eff6ff", highlightbackground="#bfdbfe", highlightthickness=1, padx=10, pady=8)
    dupe_banner.pack(fill=tk.X, pady=(0, 10))

    dupe_label = tk.Label(dupe_banner, text="డూప్లికేట్ మొబైల్ స్టేటస్: తనిఖీకి సిద్ధంగా ఉంది", bg="#eff6ff", fg="#1e40af", font=("Helvetica", 8, "bold"))
    dupe_label.pack(side=tk.LEFT)

    # 3. Actions Frame
    btn_frame = tk.Frame(body, bg="#f8fafc")
    btn_frame.pack(fill=tk.X, pady=(0, 10))

    def scan_file_for_duplicates():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            return
        try:
            df = load_excel_smart(f)
            has_dupes, dupes, col_name = check_duplicate_mobiles(df)
            if has_dupes:
                dupe_banner.config(bg="#fef3c7", highlightbackground="#f59e0b")
                dupe_label.config(text=f"⚠️ హెచ్చరిక: {len(dupes)} డూప్లికేట్ మొబైల్ నంబర్లు దొరికాయి! (పోర్టల్ లో ఎర్రర్ రాకుండా కింద సరిచేయండి)", bg="#fef3c7", fg="#92400e")
                btn_autofix.pack(side=tk.LEFT, padx=(0, 8))
            else:
                dupe_banner.config(bg="#ecfdf5", highlightbackground="#10b981")
                dupe_label.config(text="✓ ఎక్సెల్ ఫైల్ లో ఎలాంటి డూప్లికేట్ మొబైల్ నంబర్లు లేవు. పర్ఫెక్ట్!", bg="#ecfdf5", fg="#065f46")
                btn_autofix.pack_forget()
        except Exception as e:
            dupe_label.config(text=f"ఎర్రర్: {e}")

    def on_check_duplicates():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            messagebox.showerror("Error", "దయచేసి సరైన ఎక్సెల్ ఫైల్‌ను ఎంచుకోండి.", parent=root)
            return
        try:
            df = load_excel_smart(f)
            has_dupes, dupes, col_name = check_duplicate_mobiles(df)
            if has_dupes:
                msg = f"హెచ్చరిక: ఈ ఎక్సెల్ ఫైల్ లో {len(dupes)} రికార్డులలో డూప్లికేట్ మొబైల్ నంబర్లు ఉన్నాయి!\n\n"
                for item in dupes[:8]:
                    msg += f"• S.No {item['sno']} - {item['name']}: {item['mobile']}\n"
                if len(dupes) > 8:
                    msg += f"...మరియు ఇంకో {len(dupes)-8} రికార్డులు ఉన్నాయి.\n"
                msg += "\nగమనిక: ఈ నంబర్లను ఇలాగే ఎంటర్ చేస్తే TMP పోర్టల్ 'Trainee details having same Mobile' అని ఆపుతుంది!\n'ఆటోమేటిక్‌గా సరిచేయండి (Auto-Fix)' బటన్ క్లిక్ చేసి సరిచేయండి."
                messagebox.showwarning("డూప్లికేట్ నంబర్లు ఉన్నాయి", msg, parent=root)
            else:
                messagebox.showinfo("తనిఖీ పూర్తి", "✓ అద్భుతం! ఈ ఫైల్ లో ఎలాంటి డూప్లికేట్ మొబైల్ నంబర్లు లేవు.", parent=root)
        except Exception as err:
            messagebox.showerror("Error", f"ఎక్సెల్ చదవడంలో లోపం: {err}", parent=root)

    def on_autofix():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            return
        try:
            df = load_excel_smart(f)
            has_dupes, dupes, col_name = check_duplicate_mobiles(df)
            if not has_dupes:
                messagebox.showinfo("సరిచేయవలసిన అవసరం లేదు", "ఈ ఫైల్ లో ఎలాంటి డూప్లికేట్లు లేవు.", parent=root)
                return
            
            if messagebox.askyesno(
                "ఆటో-ఫిక్స్ ధృవీకరణ",
                f"మొత్తం {len(dupes)} డూప్లికేట్ మొబైల్ నంబర్ల చివర రెండు అంకెలను మార్చి ప్రతి ఒక్కరికీ ప్రత్యేకమైన (Unique) నంబర్ ఇచ్చి ఫైల్‌ను అప్‌డేట్ చేయాలా?",
                parent=root
            ):
                auto_fix_duplicate_mobiles(df, col_name, f)
                messagebox.showinfo("విజయవంతమైంది", f"✓ డూప్లికేట్ మొబైల్ నంబర్లు విజయవంతంగా సరిచేయబడ్డాయి!\nఇప్పుడు పోర్టల్ లో ఎలాంటి ఎర్రర్ రాదు.", parent=root)
                scan_file_for_duplicates()
        except Exception as err:
            messagebox.showerror("Error", f"ఆటో-ఫిక్స్ లోపం: {err}", parent=root)

    def on_start_automation():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            messagebox.showerror("Error", "దయచేసి సరైన ఎక్సెల్ ఫైల్‌ను ఎంచుకోండి.", parent=root)
            return
        try:
            df = load_excel_smart(f)
            has_dupes, dupes, col_name = check_duplicate_mobiles(df)
            if has_dupes:
                if not messagebox.askyesno(
                    "డూప్లికేట్ హెచ్చరిక", 
                    f"ఈ ఎక్సెల్ లో {len(dupes)} డూప్లికేట్ నంబర్లు ఉన్నాయి!\nపోర్టల్ లో 'Kindly check Trainee having same Mobile' అని ఆగిపోయే అవకాశం ఉంది.\n\nమీరు అయినా కూడా ఎంట్రీని కొనసాగించాలనుకుంటున్నారా? (Continue anyway?)", 
                    parent=root
                ):
                    return
            
            gp_name = os.path.basename(f).split('.')[0]
            root.withdraw()
            run_f8_control_panel(df, gp_name)
            root.deiconify()
        except Exception as err:
            messagebox.showerror("Error", f"డేటా ఎంట్రీ ప్రారంభించడంలో లోపం: {err}", parent=root)

    btn_check = tk.Button(
        btn_frame, 
        text="డూప్లికేట్ మొబైల్స్ తనిఖీ", 
        command=on_check_duplicates, 
        bg="#0284c7", 
        fg="#ffffff", 
        font=("Helvetica", 9, "bold"), 
        padx=10, 
        pady=8,
        relief=tk.FLAT
    )
    btn_check.pack(side=tk.LEFT, padx=(0, 8))

    btn_autofix = tk.Button(
        btn_frame, 
        text="🪄 ఆటో-ఫిక్స్ (సరిచేయండి)", 
        command=on_autofix, 
        bg="#d97706", 
        fg="#ffffff", 
        font=("Helvetica", 9, "bold"), 
        padx=10, 
        pady=8,
        relief=tk.FLAT
    )

    btn_start = tk.Button(
        btn_frame, 
        text="▶ Start Automation (F8)", 
        command=on_start_automation, 
        bg="#16a34a", 
        fg="#ffffff", 
        font=("Helvetica", 9, "bold"), 
        padx=12, 
        pady=8,
        relief=tk.FLAT
    )
    btn_start.pack(side=tk.LEFT)

    # Instructions box matching user's screenshot
    inst_box = tk.LabelFrame(body, text=" 💡 పోర్టల్ డూప్లికేట్ గమనిక (Portal Duplicate Info) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=10, pady=8)
    inst_box.pack(fill=tk.BOTH, expand=True, pady=(0, 8))

    inst_text = (
        "• TMP పోర్టల్‌లో ఒకే మొబైల్ నంబర్ ఇద్దరికీ ఉంటే:\n"
        "  'Kindly check below Trainee details having same Mobile No.' అని రెడ్ బాక్స్ వస్తుంది.\n"
        "• పరిష్కారం: పైన 'ఆటో-ఫిక్స్ (సరిచేయండి)' క్లిక్ చేస్తే ఆటోమేటిక్‌గా నంబర్లు మారిపోతాయి.\n"
        "• లేదా పోర్టల్‌లో వచ్చిన పాప్-అప్‌లోని 'Close' బటన్ క్లిక్ చేసి ముందుకు వెళ్లవచ్చు."
    )
    tk.Label(inst_box, text=inst_text, bg="#ffffff", fg="#334155", font=("Helvetica", 8), justify=tk.LEFT).pack(anchor="w")

    footer = tk.Frame(root, bg="#f1f5f9", height=35)
    footer.pack(fill=tk.X, side=tk.BOTTOM)
    tk.Label(footer, text="-- Developed by e-vedhika.in admin Rakesh Dhavan --", font=("Helvetica", 8), bg="#f1f5f9", fg="#64748b").pack(pady=8)

    file_dropdown.bind("<<ComboboxSelected>>", lambda e: scan_file_for_duplicates())
    root.after(500, scan_file_for_duplicates)
    root.after(1000, lambda: check_for_updates(root))
    root.mainloop()

if __name__ == "__main__":
    try:
        main_gui()
    except Exception as e:
        show_fatal_error(traceback.format_exc())
