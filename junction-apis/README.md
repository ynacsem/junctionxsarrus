## steps to run the application 


**Create virtual environment**
```bash
python -m venv venv
```


**Activate virtual environment**

*Windows (Command Prompt):*
```bash
venv\Scripts\activate
```


**Install Dependencies**
```bash
pip install -r requirements.txt
```

#### 4. Start the Application
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Deactivate Virtual Environment**

When you're done working on the project:
```bash
deactivate
```

# Bulk CSV Loading: Safe and Fast

To load large CSV files into the database efficiently and safely:

- Use your database's native bulk import tool (e.g., PostgreSQL COPY, MySQL LOAD DATA INFILE) for maximum speed.
- Batch inserts in transactions (e.g., 1000 rows per commit) to balance speed and safety.
- **Do NOT drop or disable constraints or indexes if you want to guarantee data safety.**
- Always back up your database before any large import.
- Validate your CSV for errors before loading to avoid rollbacks or partial loads.

This approach ensures fast loading without risking data integrity.

