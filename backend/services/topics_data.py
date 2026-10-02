TOPICS_BY_DOMAIN = {
    'Technology & AI': [
        'Should AI replace some human jobs?', 
        'Should students be allowed to use AI for assignments?', 
        'Is artificial intelligence more beneficial than harmful?', 
        'Should AI-generated content always be labelled?', 
        'Will AI make traditional education obsolete?', 
        'Should social media platforms use AI to moderate content?'
    ],
    'Education': [
        'Should college attendance be mandatory?', 
        'Are online classes better than traditional classrooms?', 
        'Should exams be replaced by continuous assessment?', 
        'Is homework necessary for learning?', 
        'Should coding be a required subject in schools?', 
        'Are standardized tests a fair measure of intelligence?'
    ],
    'Environment': [
        'Should single-use plastics be completely banned?', 
        'Is individual action enough to solve climate change?', 
        'Should nuclear energy be considered green energy?', 
        'Are electric vehicles truly better for the environment?', 
        'Should governments tax carbon emissions heavily?', 
        'Is veganism necessary to save the planet?'
    ],
    'Science': [
        'Should human cloning be allowed?', 
        'Is space exploration worth the cost?', 
        'Should animal testing be banned?', 
        'Are GMOs safe for consumption?', 
        'Should gene editing in humans be permitted?', 
        'Is the pursuit of artificial general intelligence dangerous?'
    ],
    'Business & Economics': [
        'Should the minimum wage be raised significantly?', 
        'Is remote work better than office work?', 
        'Should billionaires be taxed more heavily?', 
        'Are monopolies always bad for consumers?', 
        'Should cryptocurrency replace traditional banking?', 
        'Is capitalism the best economic system?'
    ],
    'Society & Culture': [
        'Should social media have age restrictions?',  
        'Is cancel culture harmful to free speech?', 
        'Should cultural appropriation be regulated?', 
        'Are video games harmful to children?', 
        'Should public monuments from controversial historical periods be removed?', 
        'Is online privacy more important than security?'
    ],
    'Health & Lifestyle': [
        'Should junk food be taxed?', 
        'Is mental health as important as physical health in the workplace?', 
        'Should vaccines be mandatory?', 
        'Is a four-day work week beneficial for society?', 
        'Should fast food advertising be restricted?', 
        'Is meditation overrated as a health practice?'
    ],
    'Entertainment': [
        'Are remakes and sequels ruining the film industry?', 
        'Should streaming services replace traditional cinema?', 
        'Is modern music less creative than older music?', 
        'Should video game loot boxes be considered gambling?', 
        'Are reality TV shows harmful to society?', 
        'Is binge-watching bad for you?'
    ],
    'Sports': [
        'Should esports be considered real sports?', 
        'Should athletes be role models?', 
        'Is the use of performance analytics ruining sports?', 
        'Should college athletes be paid?', 
        'Are sports scholarships fair?', 
        'Should combat sports be banned?'
    ],
    'Ethics & Philosophy': [
        'Is it ethical to eat meat?', 
        'Should euthanasia be legal?', 
        'Is privacy a fundamental right in the digital age?', 
        'Can a machine ever be truly conscious?', 
        'Is it ethical to create designer babies?', 
        'Should we prioritize the greater good over individual rights?'
    ],
    'Career & Workplace': [
        'Should companies require employees to return to office?', 
        'Is a college degree still necessary for career success?', 
        'Should the gig economy be more regulated?', 
        'Is work-life balance achievable in competitive industries?', 
        'Should companies implement a four-day work week?', 
        'Are unpaid internships exploitative?'
    ],
    'General': [
        'Is it better to be a specialist or a generalist?', 
        'Should voting be mandatory?', 
        'Is technology making us smarter or dumber?', 
        'Should there be a universal basic income?', 
        'Are traditions important in modern society?', 
        'Is globalization more beneficial than harmful?'
    ]
}

ALL_DOMAINS = list(TOPICS_BY_DOMAIN.keys())

def get_topics_for_domain(domain):
    return TOPICS_BY_DOMAIN.get(domain, [])

def get_all_topics():
    return TOPICS_BY_DOMAIN
