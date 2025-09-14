import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "Premium Cakes for Every Occasion",
    heading: "Premium",
    description: "Whether you're celebrating a birthday, anniversary, or simply want to satisfy your sweet tooth, our premium cakes are the perfect addition to any occasion. Made with only the finest ingredients and crafted by our talented team of bakers.",
    buttonText: "Order Now",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1989&q=80",
  },
  {
    id: 2,
    title: "Discover the Flavors of Sri Lanka",
    heading: "Traditional",
    description: "At Velvet Crumbs, we're proud to offer a wide selection of traditional Sri Lankan sweets and treats, made using time-honored recipes and techniques passed down from generations of expert bakers.",
    buttonText: "Discover More",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=1989&q=80",
  },
  {
    id: 3,
    title: "Customized Cakes for Your Special Day",
    heading: "Personalized",
    description: "We believe that every occasion deserves a special cake to mark the celebration. That's why we offer a wide range of custom cake options, perfect for weddings, birthdays, anniversaries, and more.",
    buttonText: "Explore",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1939&q=80",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden mt-16" data-testid="hero-slider">
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            data-testid={`slide-${index}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 hero-gradient" />
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <h2 className="text-lg font-medium mb-2" data-testid={`slide-title-${index}`}>
                  {slide.title}
                </h2>
                <h1 className="text-6xl font-bold mb-6" data-testid={`slide-heading-${index}`}>
                  {slide.heading}
                </h1>
                <p className="text-xl mb-8 leading-relaxed" data-testid={`slide-description-${index}`}>
                  {slide.description}
                </p>
                <Button 
                  className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                  data-testid={`button-${slide.heading.toLowerCase()}`}
                >
                  {slide.buttonText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20" data-testid="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => goToSlide(index)}
            data-testid={`dot-${index}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors z-20"
        onClick={prevSlide}
        data-testid="button-prev"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors z-20"
        onClick={nextSlide}
        data-testid="button-next"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </section>
  );
}
