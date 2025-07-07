-- Create travels table
CREATE TABLE IF NOT EXISTS public.travels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    destination TEXT NOT NULL,
    budget DECIMAL(10,2),
    participants TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.travels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.travels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.travels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.travels
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.travels
    FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travels_updated_at BEFORE UPDATE ON public.travels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 