
-- Create health_conditions table
CREATE TABLE public.health_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  diagnosed_date DATE,
  last_checkup DATE,
  severity TEXT DEFAULT 'mild',
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create symptoms table
CREATE TABLE public.symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  severity INTEGER DEFAULT 5,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT DEFAULT 'once daily',
  condition TEXT,
  started_date DATE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vital_signs table
CREATE TABLE public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_conditions
CREATE POLICY "Users can view their own conditions" ON public.health_conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conditions" ON public.health_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conditions" ON public.health_conditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conditions" ON public.health_conditions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for symptoms
CREATE POLICY "Users can view their own symptoms" ON public.symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own symptoms" ON public.symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own symptoms" ON public.symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own symptoms" ON public.symptoms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vital_signs
CREATE POLICY "Users can view their own vital signs" ON public.vital_signs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vital signs" ON public.vital_signs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vital signs" ON public.vital_signs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vital signs" ON public.vital_signs FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_health_conditions_updated_at BEFORE UPDATE ON public.health_conditions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
