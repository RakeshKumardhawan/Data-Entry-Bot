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

def check_duplicate_mobiles(df):
    if 'Mobile' not in df.columns:
        return False, []
    duplicates = df[df.duplicated('Mobile', keep=False)]
    if not duplicates.empty:
        records = []
        for index, row in duplicates.iterrows():
            s_no = row['S.No'] if 'S.No' in df.columns else index + 1
            records.append((s_no, str(row['Mobile'])))
        return True, records
    return False, []

def run_f8_control_panel(df, gp_name):
    root_init = tk.Tk()
    root_init.withdraw() 
    root_init.attributes('-topmost', True) 
    
    messagebox.showinfo(
        "Automation Ready", 
        f"Automation Ready for {gp_name}!\n\n1. Open Chrome and keep the first 'Name' box ready.\n2. Press 'F8' on your keyboard for each record entry.\n\n-- Developed by e-vedhika.in admin Rakesh Dhavan --", 
        parent=root_init
    )
    root_init.destroy()

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

    def start_action():
        is_paused[0] = False
        status_label.config(text=f"Record {current_index[0] + 1} ready. Press F8", fg="#2563eb")

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
    btn_start.pack(pady=3)

    btn_pause = tk.Button(control_win, text="Pause", bg="#f59e0b", fg="white", font=("Arial", 9, "bold"), width=24, command=pause_action, relief=tk.FLAT)
    btn_pause.pack(pady=3)

    btn_resume = tk.Button(control_win, text="Resume", bg="#0284c7", fg="white", font=("Arial", 9, "bold"), width=24, command=resume_action, relief=tk.FLAT)
    btn_resume.pack(pady=3)

    btn_cancel = tk.Button(control_win, text="Stop / Cancel", bg="#dc2626", fg="white", font=("Arial", 9, "bold"), width=24, command=cancel_action, relief=tk.FLAT)
    btn_cancel.pack(pady=3)

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
            
            # 3. Mobile 
            time.sleep(0.15)
            mobile = str(row.iloc[3]) if len(row) > 3 else str(row.get('Mobile', ''))
            if mobile != 'nan': 
                pyautogui.write(mobile.split('.')[0], interval=0.01)
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
    root.geometry("520x460")
    root.minsize(500, 420)
    root.configure(bg="#f8fafc")

    header = tk.Frame(root, bg="#0c3875", height=70)
    header.pack(fill=tk.X)

    tk.Label(header, text="E-Vedhika — Data Entry Bot", font=("Helvetica", 14, "bold"), fg="#ffffff", bg="#0c3875").pack(anchor="w", padx=18, pady=(10, 2))
    tk.Label(header, text="TMP పోర్టల్ ఆటోమేషన్ • F8 కీబోర్డ్ ఎంట్రీ (v1.0.0)", font=("Helvetica", 9), fg="#fbe947", bg="#0c3875").pack(anchor="w", padx=18, pady=(0, 10))

    body = tk.Frame(root, bg="#f8fafc", padx=18, pady=12)
    body.pack(fill=tk.BOTH, expand=True)

    excel_files = [f for f in os.listdir() if f.endswith('.xlsx') or f.endswith('.xls')]
    if not excel_files:
        demo_df = pd.DataFrame({
            'S.No': [1, 2],
            'Name': ['Demo User One', 'Demo User Two'],
            'Email': ['demo1@gmail.com', 'demo2@gmail.com'],
            'Mobile': [9876543210, 9123456789],
            'Designation': ['Villager', 'Villager'],
            'Organization': ['Gram Panchayat', 'Gram Panchayat'],
            'Gender': ['Male', 'Female'],
            'Category': ['SC', 'ST']
        })
        demo_df.to_excel('demo_data.xlsx', index=False)
        excel_files = ['demo_data.xlsx']

    f_box = tk.LabelFrame(body, text=" 1. ఎక్సెల్ ఫైల్ ఎంపిక (Select Excel File) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=12, pady=10)
    f_box.pack(fill=tk.X, pady=(0, 12))

    selected_file = tk.StringVar(value=excel_files[0] if excel_files else "")

    combo_frame = tk.Frame(f_box, bg="#ffffff")
    combo_frame.pack(fill=tk.X)

    tk.Label(combo_frame, text="ఫైల్:", bg="#ffffff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(0, 8))
    file_dropdown = ttk.Combobox(combo_frame, textvariable=selected_file, values=excel_files, state="readonly", width=30)
    file_dropdown.pack(side=tk.LEFT, padx=(0, 8))

    def browse_custom_file():
        p = filedialog.askopenfilename(title="Excel ఫైల్‌ను ఎంచుకోండి", filetypes=[("Excel Files", "*.xlsx;*.xls"), ("All Files", "*.*")])
        if p:
            if p not in excel_files:
                excel_files.append(p)
                file_dropdown['values'] = excel_files
            selected_file.set(p)

    tk.Button(combo_frame, text="Browse...", command=browse_custom_file, bg="#e2e8f0", font=("Helvetica", 8)).pack(side=tk.LEFT)

    p_box = tk.LabelFrame(body, text=" 2. పోర్టల్ ఎంపిక (Select Portal) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=12, pady=10)
    p_box.pack(fill=tk.X, pady=(0, 12))

    portal_var = tk.StringVar(value="TMP Portal")
    tk.Radiobutton(p_box, text="TMP Portal (గ్రామ పంచాయతీ డేటా ఎంట్రీ)", variable=portal_var, value="TMP Portal", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#0c3875").pack(anchor="w")

    btn_frame = tk.Frame(body, bg="#f8fafc")
    btn_frame.pack(fill=tk.X, pady=(0, 8))

    def on_check_duplicates():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            messagebox.showerror("Error", "దయచేసి సరైన ఎక్సెల్ ఫైల్‌ను ఎంచుకోండి.", parent=root)
            return
        try:
            df = pd.read_excel(f)
            has_dupes, dupes = check_duplicate_mobiles(df)
            if has_dupes:
                msg = f"హెచ్చరిక: ఈ ఎక్సెల్ ఫైల్ లో {len(dupes)} డూప్లికేట్ మొబైల్ నంబర్లు ఉన్నాయి!\n\n"
                for sno, mob in dupes[:10]:
                    msg += f"• Serial: {sno} | Mobile: {mob}\n"
                if len(dupes) > 10:
                    msg += f"...మరియు ఇంకో {len(dupes)-10} రికార్డులు ఉన్నాయి.\n"
                messagebox.showwarning("డూప్లికేట్ నంబర్లు ఉన్నాయి", msg, parent=root)
            else:
                messagebox.showinfo("తనిఖీ పూర్తి", "✓ అద్భుతం! ఈ ఫైల్ లో ఎలాంటి డూప్లికేట్ మొబైల్ నంబర్లు లేవు.", parent=root)
        except Exception as err:
            messagebox.showerror("Error", f"ఎక్సెల్ చదవడంలో లోపం: {err}", parent=root)

    def on_start_automation():
        f = selected_file.get().strip()
        if not f or not os.path.exists(f):
            messagebox.showerror("Error", "దయచేసి సరైన ఎక్సెల్ ఫైల్‌ను ఎంచుకోండి.", parent=root)
            return
        try:
            df = pd.read_excel(f)
            has_dupes, dupes = check_duplicate_mobiles(df)
            if has_dupes:
                if not messagebox.askyesno("డూప్లికేట్ హెచ్చరిక", f"ఈ ఎక్సెల్ లో {len(dupes)} డూప్లికేట్ మొబైల్ నంబర్లు ఉన్నాయి!\nమీరు అయినా కూడా ఎంట్రీని కొనసాగించాలనుకుంటున్నారా? (Continue anyway?)", parent=root):
                    return
            
            gp_name = os.path.basename(f).split('.')[0]
            root.withdraw()
            run_f8_control_panel(df, gp_name)
            root.deiconify()
        except Exception as err:
            messagebox.showerror("Error", f"డేటా ఎంట్రీ ప్రారంభించడంలో లోపం: {err}", parent=root)

    btn_check = tk.Button(
        btn_frame, 
        text="డూప్లికేట్ మొబైల్స్ చెక్ చేయండి", 
        command=on_check_duplicates, 
        bg="#0284c7", 
        fg="#ffffff", 
        font=("Helvetica", 9, "bold"), 
        padx=12, 
        pady=8,
        relief=tk.FLAT
    )
    btn_check.pack(side=tk.LEFT, padx=(0, 10))

    btn_start = tk.Button(
        btn_frame, 
        text="▶ Start Automation (F8 Panel)", 
        command=on_start_automation, 
        bg="#16a34a", 
        fg="#ffffff", 
        font=("Helvetica", 9, "bold"), 
        padx=14, 
        pady=8,
        relief=tk.FLAT
    )
    btn_start.pack(side=tk.LEFT)

    footer = tk.Frame(root, bg="#f1f5f9", height=35)
    footer.pack(fill=tk.X, side=tk.BOTTOM)
    tk.Label(footer, text="-- Developed by e-vedhika.in admin Rakesh Dhavan --", font=("Helvetica", 8), bg="#f1f5f9", fg="#64748b").pack(pady=8)

    root.after(1000, lambda: check_for_updates(root))
    root.mainloop()

if __name__ == "__main__":
    try:
        main_gui()
    except Exception as e:
        show_fatal_error(traceback.format_exc())
