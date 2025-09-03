import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  GitBranch, 
  Sparkles, 
  Globe, 
  MessageCircle,
  ArrowRight,
  Play,
  Star,
  Check
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Track every change to your story with powerful version control tools designed for narrative content.'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Write together in real-time with live cursors, comments, and seamless conflict resolution.'
    },
    {
      icon: Globe,
      title: 'World Building',
      description: 'Create rich, interconnected worlds with characters, locations, and lore that evolve with your story.'
    },
    {
      icon: MessageCircle,
      title: 'Story Analytics',
      description: 'Get insights into your narrative structure, character development, and pacing with AI-powered analytics.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Fantasy Author',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      quote: 'Mythos transformed how my writing group collaborates. The version control for stories is revolutionary!'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Game Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      quote: 'Building complex game narratives has never been easier. The world-building tools are incredible.'
    },
    {
      name: 'Emily Watson',
      role: 'Screenwriter',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      quote: 'Finally, a platform that understands the collaborative nature of modern storytelling.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Solo Writer',
      price: 'Free',
      description: 'Perfect for individual writers',
      features: [
        '3 active projects',
        'Basic version control',
        'Character & world management',
        'Community support'
      ],
      popular: false
    },
    {
      name: 'Creative Team',
      price: '$12/month',
      description: 'Ideal for small writing groups',
      features: [
        'Unlimited projects',
        'Advanced version control',
        'Real-time collaboration',
        'Priority support',
        'Advanced analytics'
      ],
      popular: true
    },
    {
      name: 'Studio',
      price: '$39/month',
      description: 'For professional studios',
      features: [
        'Everything in Creative Team',
        'Advanced permissions',
        'Custom integrations',
        'Dedicated support',
        'Enterprise security'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">
                Mythos
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">
                Pricing
              </a>
              <Link 
                to="/login"
                className="text-gray-600 hover:text-blue-600"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <span className="text-blue-600 font-medium">The Future of Collaborative Storytelling</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800">
              Build Worlds,
              <br />
              Tell Stories,
              <br />
              Together.
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Mythos is the collaborative storytelling platform that brings version control to narrative creation. 
              Write, build, and evolve your stories with teams around the world.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <Link 
                to="/register"
                className="bg-blue-500 text-white px-8 py-3 rounded font-semibold hover:bg-blue-600 flex items-center gap-2"
              >
                Start Creating <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-blue-600">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Powerful Tools for Modern Storytellers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, collaborate, and evolve your stories in one comprehensive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded p-8 border border-gray-200 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Loved by Creators Worldwide
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded p-6 border border-gray-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Choose Your Creative Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale as your storytelling ambitions grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded p-8 border transition-all hover:shadow-md ${
                  plan.popular 
                    ? 'border-blue-300 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-gray-800">{plan.price}</div>
                  {plan.price !== 'Free' && <p className="text-gray-600">per user</p>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/register"
                  className={`block text-center py-3 px-6 rounded font-semibold ${
                    plan.popular
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'border-2 border-gray-200 text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Storytelling?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of writers who are already creating amazing stories with Mythos.
          </p>
          <Link 
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded font-semibold hover:bg-gray-100 inline-flex items-center gap-2"
          >
            Start Your Story Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Mythos</span>
            </div>
            
            <p className="text-gray-400">
              © 2024 Mythos. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;